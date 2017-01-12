angular.module('svgmap', []).directive('svgMap', function() {
  return {
    templateUrl: 'img/svg/map.svg',
    restrict: 'E',
    replace: true,
    scope: {
      id: '@',
      selected: '='
    },
    controller: function($scope, $element, $attrs, $timeout) {
      var bindClick, bindPinch, bindQuickSelect, classes, debug, deselect, deselectAll, deselectLine, deselectRelation, getStation, getStationClass, handleClick, handleQuickSelect, hide, isHidden, log, parseId, render, select, selectAll, selectLine, selectRelation, selectors, show, shownCount, toggle;
      debug = false;
      classes = {
        hidden: 'map-hidden'
      };
      selectors = {
        stations: '#stations > g > g',
        elements: '#elements > path',
        lines: ['#lines > g > line', '#lines > g > path', '#lines > g > polyline'],
        quick_selects: '#svg-quick-selects div[data-coordinates]',
        hidden: '.map-hidden',
        shown: ':not(.map-hidden)',
        inner_station_ids: [83, 109, 51, 63, 131, 91, 38, 86, 92, 47, 54, 15, 74, 196, 12, 4, 8, 18, 19, 187, 198, 189, 192, 120, 193, 199, 68, 158, 188, 190, 191, 140, 129, 157, 126, 66, 60, 156, 111, 71, 138, 153, 132, 133, 90, 102, 82, 194, 48, 195, 137, 56, 58, 122, 104]
      };
      $scope.show_quick_selects = false;
      render = function() {
        if ('string' === typeof $scope.selected) {
          $scope.selected = $scope.selected.split(',');
        }
        deselectAll();
        if ($scope.selected && $scope.selected.length && _.isArray($scope.selected)) {
          return selectAll();
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
      select = function(station_id) {
        show(getStation(station_id));
        selectRelation(station_id);
        selectLine(station_id);
        log(station_id);
        if ($scope.selected.indexOf(station_id) === -1) {
          return $scope.selected.push(station_id);
        }
      };
      selectRelation = function(station_id) {
        return show($(selectors.elements + ".station-" + station_id, $element));
      };
      selectLine = function(station_id) {
        var next, prev, station;
        station = getStation(station_id);
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
        deselectLine(station_id);
        return $scope.selected = _.without($scope.selected, station_id);
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
      handleClick = function(event) {
        var elem, station;
        elem = $(event.target);
        station = elem.parent('g', $element);
        return toggle(station);
      };
      bindClick = function() {
        $("" + selectors.stations, $element).off('click').on('click', function(e) {
          return handleClick(e);
        });
        return bindQuickSelect();
      };
      handleQuickSelect = function(line_id, station_id, mode) {
        var j, len, ref, station, stations, toggle_mode;
        station = getStation(station_id);
        switch (mode) {
          case 0:
            stations = station.prevAll();
            break;
          case 1:
            stations = station.nextAll();
            break;
          case 2:
            stations = station.siblings().addBack();
            break;
          case 3:
            stations = station.siblings().addBack();
            ref = selectors.inner_station_ids;
            for (j = 0, len = ref.length; j < len; j++) {
              station_id = ref[j];
              stations.push(getStation(station_id)[0]);
            }
        }
        toggle_mode = stations.length === shownCount(stations) ? 0 : 1;
        $.each(stations, function() {
          return toggle(this, toggle_mode);
        });
        return $timeout(function() {
          return $scope.$apply();
        });
      };
      bindQuickSelect = function() {
        return $(selectors.quick_selects, $element).each(function() {
          var line_id, matches, mode, quick_selector, station_id;
          quick_selector = $(this, $element);
          matches = quick_selector.data('coordinates').match(/([0-9]+)-([0-9]+)-([0-9]+)/);
          line_id = parseInt(matches[1]);
          station_id = parseInt(matches[2]);
          mode = parseInt(matches[3]);
          return quick_selector.off('click').on('click', function() {
            return handleQuickSelect(line_id, station_id, mode);
          });
        });
      };
      bindPinch = function() {
        $element.panzoom('destroy');
        $element.panzoom({
          minScale: 1.2,
          maxScale: 5,
          contain: 'automatic',
          panOnlyWhenZoomed: true
        });
        return $element.panzoom('zoom', 2.5, {
          silent: true
        });
      };
      toggle = function(station, force) {
        if (_.isNumber(force)) {
          if (force) {
            return select(parseId(station));
          } else {
            return deselect(parseId(station));
          }
        } else {
          if (isHidden(station)) {
            return select(parseId(station));
          } else {
            return deselect(parseId(station));
          }
        }
      };
      parseId = function(station) {
        var id;
        if (_.isString(station)) {
          id = station;
        } else if (station instanceof jQuery) {
          id = station.attr('id');
        } else {
          id = station.id;
        }
        return parseInt(id.replace(/[^\d]/g, ''));
      };
      getStation = function(station_id) {
        if (station_id) {
          return $(selectors.stations + "#station-" + station_id, $element);
        } else {
          return $("" + selectors.stations, $element);
        }
      };
      isHidden = function(station) {
        return station.is(selectors.hidden);
      };
      shownCount = function(stations) {
        return stations.filter(selectors.shown).length;
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
      $scope.$watchCollection('selected', function(newVal, oldVal) {
        return render();
      });
      log = function(message) {
        if (debug) {
          return console.log("svg-map: " + message);
        }
      };
      $scope.selectAllStations = function() {
        var j, len, ref, results, station;
        $scope.selected = [];
        ref = getStation();
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          station = ref[j];
          results.push(select(parseId(station)));
        }
        return results;
      };
      return (function() {
        render();
        if ($attrs.hasOwnProperty('selectable')) {
          bindClick() && ($scope.show_quick_selects = true);
        }
        if ($attrs.hasOwnProperty('scalable')) {
          return bindPinch();
        }
      })();
    }
  };
});
