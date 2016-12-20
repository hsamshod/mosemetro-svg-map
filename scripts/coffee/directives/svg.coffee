app.directive 'svgMap', ->
	templateUrl: map_path + 'map.svg'
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
			log 'elem not specified' if not $scope.id
			deselectAll()
			selectAll() if $scope.selected.length
			bindClick() if $attrs.hasOwnProperty 'selectable'
			bindPinch() if $attrs.hasOwnProperty 'scalable'

		selectAll = ->
			select station_id for station_id in $scope.selected

		select = (station_id) ->
			$ "#{selectors.stations}#station-#{station_id}", $element
				.removeClass classes.hidden
			selectRelation station_id
			selectLine station_id
			$scope.selected.push station_id

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

			if station.is selectors.hidden
				select parseId station
			else
				deselect parseId station

		bindClick = ->
			$ "#{selectors.stations}", $element
				.on 'click', toggle

		bindPinch = ->
#			$element.css 'width', $attrs.width
#			$element.css 'height', $attrs.height
			$element.panzoom()


		save = ->
			console.log 'save'

		log = (message) ->
			throw "svg-map: #{message}"

		parseId = (station) ->
			id = station.attr 'id'
						.replace 'station-', ''
			parseInt id

		init()