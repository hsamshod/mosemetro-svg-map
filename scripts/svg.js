angular.module('svgmap', []).directive('svgMap', function() {
  return {
    templateUrl: 'img/svg/map.svg',
    restrict: 'E',
    replace: true,
    scope: {
      id: '@',
      selected: '='
    },
    controller: function($scope, $element, $attrs) {
      var bindClick, bindPinch, classes, deselect, deselectAll, deselectLine, deselectRelation, init, isHidden, log, parseId, save, select, selectAll, selectLine, selectRelation, selectors, toggle;
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
        deselectAll();
        if ($scope.selected && $scope.selected.length) {
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
          results.push(select(station_id, true));
        }
        return results;
      };
      select = function(station_id, initing) {
        $(selectors.stations + "#station-" + station_id, $element).removeClass(classes.hidden);
        selectRelation(station_id);
        selectLine(station_id);
        if (!initing) {
          return $scope.selected.push(station_id);
        }
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
        station = +station;
        if (isHidden(station)) {
          return select(station);
        } else {
          return deselect(station);
        }
      };
      bindClick = function() {
        return $("" + selectors.stations, $element).off('click').on('click', toggle);
      };
      bindPinch = function() {
        $element.panzoom('destroy');
        $element.panzoom({
          contain: 'automatic',
          minScale: 1,
          maxScale: 3,
          panOnlyWhenZoomed: true
        });
        return $element.panzoom('zoom', 2, {
          silent: true
        });
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
      isHidden = function(station) {
        return station.is(selectors.hidden);
      };
      $scope.$watch('selected', function(newVal, oldVal) {
        return init();
      });
      return init();
    }
  };
});
