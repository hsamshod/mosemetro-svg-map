app.service 'SvgService', ->
	@svgdom   = null
	@options  =
		el:           null
		selected:     []

	@selectors =
		stations:       '#stations > g > g'
		elements:       '#elements path'
		lines:          ['#lines > g > line', '#lines > g > path', '#lines > g > polyline']
		hidden:         '.map-hidden'
		shown:          ':not(.map-hidden)'

	@classes =
		hidden:         'map-hidden'

	@init = (options) ->
		_.extend @options, options
		@log_error 'elem not specified' if not @options.el

		@svgdom = $ "##{@options.el}"
		@deselectAll()
		@selectAll() if @options.selected.length

	@selectAll = ->
		@select station_id for station_id in @options.selected

	@select = (station_id) ->
		$ "#{@selectors.stations}#station-#{station_id}", @svgdom
			.removeClass @classes.hidden
		@selectRelation station_id
		@selectLine station_id
		@options.selected.push station_id

	@selectRelation = (station_id) ->
		$ "#{@selectors.elements}.station-#{station_id}", @svgdom
			.removeClass @classes.hidden

	@selectLine = (station_id) ->
		station = $ "#{@selectors.stations}.station-#{station_id}", @svgdom

		next = station.next @selectors.shown
		next = station.siblings().first().filter @selectors.shown if not next.length

		prev = station.prev @selectors.shown
		prev = station.siblings().last().filter @selectors.shown if not prev.length

		$ [prev, next]
			.each (i, item) =>
				if item.length
					#generate selector
					line_class = ".station-#{station_id}.#{item.attr 'id'}"
					line_class = "#{@selectors.lines.join(line_class + ',') + line_class}"

					$ line_class, @svgdom
						.removeClass @classes.hidden

	@deselectAll = (reset_data) ->
		$ "#{@selectors.stations}, #{@selectors.elements}, #{@selectors.lines.join()}", @svgdom
			.addClass @classes.hidden
		@options.selected = [] if reset_data

	@deselect = (station_id) ->
		$ "#{@selectors.stations}#station-#{station_id}", @svgdom
			.addClass @classes.hidden
		@deselectRelation station_id
		@deselectLine station_id

	@deselectRelation = (station_id) ->
		$ "#{@selectors.elements}.station-#{station_id}", @svgdom
			.addClass @classes.hidden

	@deselectLine = (station_id) ->
		station = $ "#{@selectors.stations}.station-#{station_id}", @svgdom

		line_class = ".station-#{station_id}"
		line_class = "#{@selectors.lines.join(line_class + ',') + line_class}"

		$ line_class, @svgdom
			.addClass @classes.hidden

	@toggle = (station_id) ->
		station = $ "#{@selectors.stations}#station-#{station_id}", @svgdom
		if station.is @selectors.hidden
			@select station_id
		else
			@deselect station_id

	@bindClick = ->
		$ "#{@selectors.stations}#station-#{station_id}", @svgdom
			.on 'click', @toggle


	@save = ->
		console.log 'save'

	@log_error = (message) ->
		throw "svg service: #{message}"
	@