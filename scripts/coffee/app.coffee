bindArguments = (scope, depencies) ->
	function_arguments = getArguments depencies.callee
	scope[function_name] = function_name if function_name[0] is '$' for function_name in function_arguments

STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
ARGUMENT_NAMES = /([^\s,]+)/g;

getArguments = (func) ->
	fnStr = func.toString().replace STRIP_COMMENTS, ''
	result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match ARGUMENT_NAMES
	result = [] if result is null
	result

map_path = 'views/'
scope    = null

app = angular.module 'svg-map', []
	.controller 'map', ($scope) ->
		$scope.showmap = 0
		scope = angular.element '[ng-app=svg-map]'
			.scope()
