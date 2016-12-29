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
      var bindClick, bindPinch, classes, deselect, deselectAll, deselectLine, deselectRelation, getStation, getStationClass, hide, init, isHidden, log, parseId, save, select, selectAll, selectLine, selectRelation, selectors, show, toggle;
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
        show(getStation(station_id));
        selectRelation(station_id);
        selectLine(station_id);
        if (!initing) {
          return $scope.selected.push(station_id);
        }
      };
      selectRelation = function(station_id) {
        return show($(selectors.elements + ".station-" + station_id, $element));
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
              return show($(line_class, $element));
            }
          };
        })(this));
      };
      deselectAll = function(reset_data) {
        hide($(selectors.stations + ", " + selectors.elements + ", " + (selectors.lines.join()), $element));
        if (reset_data) {
          return options.selected = [];
        }
      };
      deselect = function(station_id) {
        hide(getStation(station_id));
        deselectRelation(station_id);
        return deselectLine(station_id);
      };
      deselectRelation = function(station_id) {
        var enabled_count, relation;
        relation = $(selectors.elements + ".station-" + station_id, $element);
        if (relation.length) {
          enabled_count = _.reduce(relation[0].classList, function(memo, relation_class) {
            if ((relation_class !== getStationClass(station_id)) && relation_class.match(/station\-[0-9]+$/) && !isHidden(getStation(parseId(relation_class)))) {
              memo++;
            }
            return memo;
          }, 0);
          if (!enabled_count) {
            return hide(relation);
          }
        }
      };
      deselectLine = function(station_id) {
        var line_class, station;
        station = $(selectors.stations + ".station-" + station_id, $element);
        line_class = ".station-" + station_id;
        line_class = "" + (selectors.lines.join(line_class + ',') + line_class);
        return hide($(line_class, $element));
      };
      toggle = function(event) {
        var elem, station;
        elem = $(event.target);
        station = elem.parent('g', $element);
        if (isHidden(station)) {
          return select(parseId(station));
        } else {
          return deselect(parseId(station));
        }
      };
      bindClick = function() {
        return $("" + selectors.stations, $element).off('click').on('click', toggle);
      };
      bindPinch = function() {
        $element.panzoom('destroy');
        $element.panzoom({
          minScale: 1,
          maxScale: 3,
          contain: 'automatic',
          panOnlyWhenZoomed: true,
          animate: false
        });
        return $element.panzoom('zoom', 2, {
          silent: true
        });
      };
      save = function() {
        return console.log('save');
      };
      log = function(message) {
        throw "svg-metro: " + message;
      };
      parseId = function(station) {
        var id;
        if (_.isString(station)) {
          id = station.replace('station-', '');
        } else {
          id = station.attr('id').replace('station-', '');
        }
        return parseInt(id);
      };
      getStation = function(station_id) {
        return $(selectors.stations + "#station-" + station_id, $element);
      };
      isHidden = function(station) {
        return station.is(selectors.hidden);
      };
      getStationClass = function(station_id) {
        return "station-" + station_id;
      };
      hide = function(elem) {
        return elem.addClass(classes.hidden);
      };
      show = function(elem) {
        return elem.removeClass(classes.hidden);
      };
      $scope.$watch('selected', function(newVal, oldVal) {
        return init();
      });
      return init();
    }
  };
});
