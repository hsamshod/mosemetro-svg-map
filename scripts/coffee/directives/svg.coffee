angular
	.module 'svgmap', []
	.directive 'svgMap', ->
		templateUrl: 'img/svg/map.svg'
		restrict: 'E'
		replace: true
		scope:
			id:         '@'
			selected:   '='
		controller: ($scope, $element, $attrs) ->
			classes   =
				hidden:         'map-hidden'
			selectors =
				stations:       '#stations > g > g'
				elements:       '#elements path'
				lines:          ['#lines > g > line', '#lines > g > path', '#lines > g > polyline']
				hidden:         '.map-hidden'
				shown:          ':not(.map-hidden)'

			$scope.show_quick_selects = false

			init = ->
				deselectAll()
				selectAll() if $scope.selected and $scope.selected.length and _.isArray $scope.selected
				bindClick() and $scope.show_quick_selects = true if $attrs.hasOwnProperty 'selectable'
				bindPinch() if $attrs.hasOwnProperty 'scalable'

			selectAll = ->
				select station_id, true for station_id in $scope.selected

			select = (station_id, initing) ->
				show getStation station_id
				selectRelation station_id
				selectLine station_id
				$scope.selected.push station_id if not initing

			selectRelation = (station_id) ->
				show $ "#{selectors.elements}.station-#{station_id}", $element

			selectLine = (station_id) ->
				station = $ "#{selectors.stations}.station-#{station_id}", $element

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

			toggle = (event) ->
				elem = $ event.target
				station = elem.parent 'g', $element
				if isHidden station
					select parseId station
				else
					deselect parseId station

			bindClick = ->
				$ "#{selectors.stations}", $element
					.off 'click'
					.on 'click', toggle

			bindPinch = ->
				$element.panzoom 'destroy'
				$element.panzoom
					minScale: 1.2
					maxScale: 5
					contain: 'automatic'
					panOnlyWhenZoomed: true
					animate: false
				$element.panzoom 'zoom', 2.5,
					silent: true

			save = ->
				console.log 'save'

			log = (message) ->
				throw "svg-map: #{message}"

			parseId = (station) ->
				if _.isString station
					id = station.replace 'station-', ''
				else
					id = station.attr 'id'
							.replace 'station-', ''
				parseInt id


			getStation = (station_id) ->
				$ "#{selectors.stations}#station-#{station_id}", $element

			isHidden = (station) ->
				station.is selectors.hidden

			getStationClass = (station_id) ->
				"station-#{station_id}"

			hide = (elem) -> elem.addClass classes.hidden

			show = (elem) -> elem.removeClass classes.hidden

			$scope.$watch 'selected', (newVal, oldVal) -> init()

			$scope.selectAllStations = -> selectAll()

			init()