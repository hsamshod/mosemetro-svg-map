angular
	.module 'svgmap', []
	.directive 'svgMap', ->
		templateUrl: 'img/svg/map.svg'
		restrict: 'E'
		replace: true
		scope:
			id:         '@'
			selected:   '='
		controller: ($scope, $element, $attrs, $timeout) ->
			debug     = false
			classes   =
				hidden:                 'map-hidden'
			selectors =
				stations:               '#stations > g > g'
				elements:               '#elements > path'
				lines:                  ['#lines > g > line', '#lines > g > path', '#lines > g > polyline']
				quick_selects:          '#svg-quick-selects div[data-coordinates]'
				hidden:                 '.map-hidden'
				shown:                  ':not(.map-hidden)'
				inner_station_ids:      [
											83, 109, 51, 63, 131, 91, 38, 86, 92, 47, 54, 15, 74, 196, 12, 4,
											8, 18, 19, 187, 198, 189, 192, 120, 193, 199, 68, 158, 188, 190,
											191, 140, 129, 157, 126, 66, 60, 156, 111, 71, 138, 153, 132, 133,
											90, 102, 82, 194, 48, 195, 137, 56, 58, 122, 104
										]
			$scope.show_quick_selects = false
			$scope.orientation        = 'portrait'

			render = ->
				setOrientation()
				parseSelected()
				deselectAll()
				selectAll() if $scope.selected and $scope.selected.length and _.isArray $scope.selected

				bindClick() and $scope.show_quick_selects = true if $attrs.hasOwnProperty 'selectable'
				bindPinch() && $scope.is_scalable = true if $attrs.hasOwnProperty 'scalable'

			selectAll = ->
				select station_id, true for station_id in $scope.selected

			select = (station_id) ->
				show getStation station_id
				selectRelation station_id
				selectLine station_id
				$scope.selected.push station_id if $scope.selected.indexOf(station_id) is -1

			selectRelation = (station_id) ->
				show $ "#{selectors.elements}.station-#{station_id}", $element

			selectLine = (station_id) ->
				station = getStation station_id

				next = station.next selectors.shown
				next = station.siblings().first().filter selectors.shown if not next.length

				prev = station.prev selectors.shown
				prev = station.siblings().last().filter selectors.shown if not prev.length

				$ [prev, next]
					.each (i, item) =>
						if item.length
							line_class = ".station-#{station_id}.#{item.attr 'id'}"
							line_class = "#{selectors.lines.join(line_class + ',') + line_class}"

							show $ line_class, $element

			deselectAll = (reset_data) ->
				hide $ "#{selectors.stations}, #{selectors.elements}, #{selectors.lines.join()}", $element
				options.selected = [] if reset_data

			deselect = (station_id) ->
				hide getStation station_id
				deselectRelation station_id
				deselectLine station_id
				$scope.selected = _.without $scope.selected, station_id

			deselectRelation = (station_id) ->
				relation = $ "#{selectors.elements}.station-#{station_id}", $element
				if relation.length
					enabled_count = _.reduce relation[0].classList, (memo, relation_class) ->
						memo++ if (relation_class != getStationClass station_id) and relation_class.match(/station\-[0-9]+$/) and not isHidden getStation parseId relation_class
						memo
					, 0

					hide relation if not enabled_count

			deselectLine = (station_id) ->
				station = $ "#{selectors.stations}.station-#{station_id}", $element

				line_class = ".station-#{station_id}"
				line_class = "#{selectors.lines.join(line_class + ',') + line_class}"

				hide $ line_class, $element

			handleClick = (event) ->
				elem = $ event.target
				station = elem.parent 'g', $element
				toggle station

			bindClick = ->
				$ "#{selectors.stations}", $element
					.off 'click'
					.on 'click', (e) ->
						handleClick(e)
				bindQuickSelect()

			handleQuickSelect = (line_id, station_id, mode) ->
				station = getStation station_id
				switch mode
					when 0
						stations = station.prevAll()
					when 1
						stations = station.nextAll()
					when 2
						stations = station.siblings().addBack()
					when 3
						stations = station.siblings().addBack()
						for station_id in selectors.inner_station_ids
							stations.push getStation(station_id)[0]

				$.merge stations, related if (related = getRelatedStations stations).length

				toggle_mode = if stations.length is shownCount stations then 0 else 1
				$.each stations, ->
					toggle @, toggle_mode
				$timeout ->
					$scope.$apply()

			bindQuickSelect = ->
				$ selectors.quick_selects, $element
					.each ->
						quick_selector = $ @, $element
						matches     = quick_selector
										.data 'coordinates'
										.match /([0-9]+)-([0-9]+)-([0-9]+)/
						line_id     = parseInt matches[1]
						station_id  = parseInt matches[2]
						mode        = parseInt matches[3]
						quick_selector
							.off 'click'
							.on 'click', ->
								handleQuickSelect line_id, station_id, mode

			bindPinch = ->
				$element.panzoom 'destroy'
				alignMap()
				$element.panzoom
					minScale: 1
					maxScale: 5
					increment: 1.2
					contain: 'automatic'
					panOnlyWhenZoomed: false

			toggle = (station, force) ->
				if _.isNumber force
					if force then select parseId station else deselect parseId station
				else
					if isHidden station
						select parseId station
					else
						deselect parseId station

			parseId = (station) ->
				if _.isString station
					id = station
				else if station instanceof jQuery
					id = station.attr 'id'
				else
					id = station.id
				parseInt id.replace /[^\d]/g, ''

			getStation = (station_id) ->
				if station_id
					$ "#{selectors.stations}#station-#{station_id}", $element
				else
					$ "#{selectors.stations}", $element

			getRelatedStations = (stations) ->
				related_stations = []

				_.each stations, (station) ->
					station_id  = parseId station
					relation = $ "#{selectors.elements}.station-#{station_id}", $element
					if relation.length
						_.each relation[0].classList, (relation_class) ->
							related_stations.push getStation(parseId relation_class)[0] if (relation_class != getStationClass station_id) and relation_class.match(/station\-[0-9]+$/)
				related_stations

			isHidden = (station) -> station.is selectors.hidden

			shownCount = (stations) ->
				stations
					.filter selectors.shown
					.length

			getStationClass = (station_id) -> "station-#{station_id}"

			hide = (elem) -> elem.addClass classes.hidden

			show = (elem) -> elem.removeClass classes.hidden

			$scope.$watchCollection 'selected', (newVal, oldVal) -> render()

			log = (message) -> console.log "svg-map: #{message}" if debug

			$scope.selectAllStations = ->
				if $scope.selected.length is getStation().length
					$scope.selected = [] #empty
				else
					$scope.selected = [] #empty before selecting
					select parseId station for station in getStation()

			parseSelected = -> $scope.selected = $scope.selected.split(',') if 'string' == typeof $scope.selected

			setOrientation = -> $scope.orientation = if window.innerHeight < window.innerWidth then 'landscape' else 'portrait'

			alignMap = ->
				$element.css
					transform: ''
					transformOrigin: ''
				if $scope.orientation is 'landscape'
					margin_top = ($element.parent().actual('height') - $element.actual('height')) / 2
					$element.css marginTop: margin_top + 'px'
				else
					$element.css marginTop: ''
					$ '> div', $element
						.css
							minWidth: $('> div > svg', $element).css 'width'

			watchOrientationChange = ->
				$ window
#					.off 'orientationchange'
#					.on 'orientationchange', render
					.off 'resize'
					.on 'resize', render

			watchOrientationChange()
			render()
