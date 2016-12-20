var ARGUMENT_NAMES, STRIP_COMMENTS, app, bindArguments, getArguments, map_path, scope;

bindArguments = function(scope, depencies) {
  var function_arguments, function_name;
  function_arguments = getArguments(depencies.callee);
  if ((function() {
    var i, len, results;
    results = [];
    for (i = 0, len = function_arguments.length; i < len; i++) {
      function_name = function_arguments[i];
      results.push(function_name[0] === '$');
    }
    return results;
  })()) {
    return scope[function_name] = function_name;
  }
};

STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

ARGUMENT_NAMES = /([^\s,]+)/g;

getArguments = function(func) {
  var fnStr, result;
  fnStr = func.toString().replace(STRIP_COMMENTS, '');
  result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (result === null) {
    result = [];
  }
  return result;
};

map_path = 'views/';

scope = null;

app = angular.module('svg-map', []).controller('map', function($scope) {
  $scope.showmap = 0;
  return scope = angular.element('[ng-app=svg-map]').scope();
});

app.directive('svgMap', function() {
  return {
    templateUrl: map_path + 'map.svg',
    restrict: 'E',
    replace: true,
    scope: {
      id: '@',
      selected: '='
    },
    controller: function($scope, $element, $attrs) {
      var bindClick, bindPinch, classes, deselect, deselectAll, deselectLine, deselectRelation, init, log, parseId, save, select, selectAll, selectLine, selectRelation, selectors, toggle;
      classes = {
        hidden: 'map-hidden'
      };
      selectors = {
        stations: '#stations > g > g',
        elements: '#elements path',
        lines: ['#lines > g > line', '#lines > g > path', '#lines > g > polyline'],
        hidden: '.map-hidden',
        shown: ':not(.map-hidden)'
      };
      init = function() {
        if (!$scope.id) {
          log('elem not specified');
        }
        deselectAll();
        if ($scope.selected.length) {
          selectAll();
        }
        if ($attrs.hasOwnProperty('selectable')) {
          bindClick();
        }
        if ($attrs.hasOwnProperty('scalable')) {
          return bindPinch();
        }
      };
      selectAll = function() {
        var j, len, ref, results, station_id;
        ref = $scope.selected;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          station_id = ref[j];
          results.push(select(station_id));
        }
        return results;
      };
      select = function(station_id) {
        $(selectors.stations + "#station-" + station_id, $element).removeClass(classes.hidden);
        selectRelation(station_id);
        selectLine(station_id);
        return $scope.selected.push(station_id);
      };
      selectRelation = function(station_id) {
        return $(selectors.elements + ".station-" + station_id, $element).removeClass(classes.hidden);
      };
      selectLine = function(station_id) {
        var next, prev, station;
        station = $(selectors.stations + ".station-" + station_id, $element);
        next = station.next(selectors.shown);
        if (!next.length) {
          next = station.siblings().first().filter(selectors.shown);
        }
        prev = station.prev(selectors.shown);
        if (!prev.length) {
          prev = station.siblings().last().filter(selectors.shown);
        }
        return $([prev, next]).each((function(_this) {
          return function(i, item) {
            var line_class;
            if (item.length) {
              line_class = ".station-" + station_id + "." + (item.attr('id'));
              line_class = "" + (selectors.lines.join(line_class + ',') + line_class);
              return $(line_class, $element).removeClass(classes.hidden);
            }
          };
        })(this));
      };
      deselectAll = function(reset_data) {
        $(selectors.stations + ", " + selectors.elements + ", " + (selectors.lines.join()), $element).addClass(classes.hidden);
        if (reset_data) {
          return options.selected = [];
        }
      };
      deselect = function(station_id) {
        $(selectors.stations + "#station-" + station_id, $element).addClass(classes.hidden);
        deselectRelation(station_id);
        return deselectLine(station_id);
      };
      deselectRelation = function(station_id) {
        return $(selectors.elements + ".station-" + station_id, $element).addClass(classes.hidden);
      };
      deselectLine = function(station_id) {
        var line_class, station;
        station = $(selectors.stations + ".station-" + station_id, $element);
        line_class = ".station-" + station_id;
        line_class = "" + (selectors.lines.join(line_class + ',') + line_class);
        return $(line_class, $element).addClass(classes.hidden);
      };
      toggle = function(event) {
        var elem, station;
        elem = $(event.target);
        station = elem.parent('g', $element);
        if (station.is(selectors.hidden)) {
          return select(parseId(station));
        } else {
          return deselect(parseId(station));
        }
      };
      bindClick = function() {
        return $("" + selectors.stations, $element).on('click', toggle);
      };
      bindPinch = function() {
        return $element.panzoom();
      };
      save = function() {
        return console.log('save');
      };
      log = function(message) {
        throw "svg-map: " + message;
      };
      parseId = function(station) {
        var id;
        id = station.attr('id').replace('station-', '');
        return parseInt(id);
      };
      return init();
    }
  };
});

app.service('SvgService', function() {
  this.svgdom = null;
  this.options = {
    el: null,
    selected: []
  };
  this.selectors = {
    stations: '#stations > g > g',
    elements: '#elements path',
    lines: ['#lines > g > line', '#lines > g > path', '#lines > g > polyline'],
    hidden: '.map-hidden',
    shown: ':not(.map-hidden)'
  };
  this.classes = {
    hidden: 'map-hidden'
  };
  this.init = function(options) {
    _.extend(this.options, options);
    if (!this.options.el) {
      this.log_error('elem not specified');
    }
    this.svgdom = $("#" + this.options.el);
    this.deselectAll();
    if (this.options.selected.length) {
      return this.selectAll();
    }
  };
  this.selectAll = function() {
    var j, len, ref, results, station_id;
    ref = this.options.selected;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      station_id = ref[j];
      results.push(this.select(station_id));
    }
    return results;
  };
  this.select = function(station_id) {
    $(this.selectors.stations + "#station-" + station_id, this.svgdom).removeClass(this.classes.hidden);
    this.selectRelation(station_id);
    this.selectLine(station_id);
    return this.options.selected.push(station_id);
  };
  this.selectRelation = function(station_id) {
    return $(this.selectors.elements + ".station-" + station_id, this.svgdom).removeClass(this.classes.hidden);
  };
  this.selectLine = function(station_id) {
    var next, prev, station;
    station = $(this.selectors.stations + ".station-" + station_id, this.svgdom);
    next = station.next(this.selectors.shown);
    if (!next.length) {
      next = station.siblings().first().filter(this.selectors.shown);
    }
    prev = station.prev(this.selectors.shown);
    if (!prev.length) {
      prev = station.siblings().last().filter(this.selectors.shown);
    }
    return $([prev, next]).each((function(_this) {
      return function(i, item) {
        var line_class;
        if (item.length) {
          line_class = ".station-" + station_id + "." + (item.attr('id'));
          line_class = "" + (_this.selectors.lines.join(line_class + ',') + line_class);
          return $(line_class, _this.svgdom).removeClass(_this.classes.hidden);
        }
      };
    })(this));
  };
  this.deselectAll = function(reset_data) {
    $(this.selectors.stations + ", " + this.selectors.elements + ", " + (this.selectors.lines.join()), this.svgdom).addClass(this.classes.hidden);
    if (reset_data) {
      return this.options.selected = [];
    }
  };
  this.deselect = function(station_id) {
    $(this.selectors.stations + "#station-" + station_id, this.svgdom).addClass(this.classes.hidden);
    this.deselectRelation(station_id);
    return this.deselectLine(station_id);
  };
  this.deselectRelation = function(station_id) {
    return $(this.selectors.elements + ".station-" + station_id, this.svgdom).addClass(this.classes.hidden);
  };
  this.deselectLine = function(station_id) {
    var line_class, station;
    station = $(this.selectors.stations + ".station-" + station_id, this.svgdom);
    line_class = ".station-" + station_id;
    line_class = "" + (this.selectors.lines.join(line_class + ',') + line_class);
    return $(line_class, this.svgdom).addClass(this.classes.hidden);
  };
  this.toggle = function(station_id) {
    var station;
    station = $(this.selectors.stations + "#station-" + station_id, this.svgdom);
    if (station.is(this.selectors.hidden)) {
      return this.select(station_id);
    } else {
      return this.deselect(station_id);
    }
  };
  this.bindClick = function() {
    return $(this.selectors.stations + "#station-" + station_id, this.svgdom).on('click', this.toggle);
  };
  this.save = function() {
    return console.log('save');
  };
  this.log_error = function(message) {
    throw "svg service: " + message;
  };
  return this;
});
