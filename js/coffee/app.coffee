angular.module 'svg-map', []
.controller 'map', ($scope) ->
	map_container = null

	angular.element(document).ready ->
		map_container = $ '#overlay'

	$scope.showMap = ->
		initMap() if map_container.is ':hidden'
		map_container.toggle()
		true


	initMap = ->
#		window.svgmap = new PinchZoom $ '#map' if not window.svgmap
