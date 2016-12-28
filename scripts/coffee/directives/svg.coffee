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

			init = ->
				deselectAll()
				selectAll() if $scope.selected && $scope.selected.length
				bindClick() if $attrs.hasOwnProperty 'selectable'
				bindPinch() if $attrs.hasOwnProperty 'scalable'

			selectAll = ->
				select station_id, true for station_id in $scope.selected

			select = (station_id, initing) ->
				$ "#{selectors.stations}#station-#{station_id}", $element
					.removeClass classes.hidden
				selectRelation station_id
				selectLine station_id
				$scope.selected.push station_id if not initing

			selectRelation = (station_id) ->
				$ "#{selectors.elements}.station-#{station_id}", $element
					.removeClass classes.hidden

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

							$ line_class, $element
								.removeClass classes.hidden

			deselectAll = (reset_data) ->
				$ "#{selectors.stations}, #{selectors.elements}, #{selectors.lines.join()}", $element
					.addClass classes.hidden
				options.selected = [] if reset_data

			deselect = (station_id) ->
				$ "#{selectors.stations}#station-#{station_id}", $element
					.addClass classes.hidden
				deselectRelation station_id
				deselectLine station_id

			deselectRelation = (station_id) ->
				$ "#{selectors.elements}.station-#{station_id}", $element
					.addClass classes.hidden

			deselectLine = (station_id) ->
				station = $ "#{selectors.stations}.station-#{station_id}", $element

				line_class = ".station-#{station_id}"
				line_class = "#{selectors.lines.join(line_class + ',') + line_class}"

				$ line_class, $element
					.addClass classes.hidden

			toggle = (event) ->
				elem = $ event.target
				station = elem.parent 'g', $element

				if isHidden station
					select parseInt station
				else
					deselect parseInt station

			bindClick = ->
				$ "#{selectors.stations}", $element
					.off 'click'
					.on 'click', toggle

			bindPinch = ->
				$element.panzoom 'destroy'
				$element.panzoom
					contain: 'automatic'
					minScale: 1
					maxScale: 3
					panOnlyWhenZoomed: true
				$element.panzoom 'zoom', 2,
					silent: true

			save = ->
				console.log 'save'

			log = (message) ->
				throw "svg-map: #{message}"

			parseId = (station) ->
				id = station.attr 'id'
							.replace 'station-', ''
				parseInt id

			isHidden = (station) ->
				station.is selectors.hidden

			$scope.$watch 'selected', (newVal, oldVal) ->
				init()

			init()