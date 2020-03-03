'use strict';

angular.module('myApp.map', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/map', {
      templateUrl: 'map/map.html',
      controller: 'MapCtrl'
    });
  }])

  .controller('MapCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.mymap = L.map('mapid').setView([16.888832606891466, 96.1299168993719], 13);
    $scope.layer
    $scope.busMap = {};
    $scope.busList = [];
    $scope.selectedBusStops = [];

    $scope.getInit = function () {

      $http.get("data/bus_stops.json")
      .then(function (response) {
        if (response) {
          var data = response.data[0];
          $scope.busStopMap = data;
        }
      }, function (error) {
      });

      $http.get("data/route_config.json")
      .then(function (response) {
        if (response) {
          var data = response.data[0];
          $scope.busMap = data;
          angular.forEach(data, function (value, key) {
            var busObj = {
              busNo: key,
              fileName: value
            };
            $scope.busList.push(busObj);
          });

        }
        var sidebar = L.control.sidebar({
          autopan: false,       // whether to maintain the centered map point when opening the sidebar
          closeButton: true,    // whether t add a close button to the panes
          container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
          position: 'left',     // left or right
        }).addTo($scope.mymap);
      }, function (error) {
      });
    };

    $scope.getBusRoute = function(busObj) {
      var selectedBus = busObj.busNo;
      var selectedBusFile = busObj.fileName;
      var filePath = "data/routes/" + selectedBusFile;
      $http.get(filePath)
      .then(function (response) {
        // $scope.mymap.removeLayer($scope.polyline);
        if ($scope.polyline) {
          $scope.polyline.remove();
        }

        if ($scope.selectedBusStops) {
          $scope.selectedBusStops.forEach(function (element) {
            element.remove();
          })
        }
        
        if (response) {
          var routeLatLngList = [];
          var routeCoordinatesList = response.data.shape.geometry.coordinates;
          routeCoordinatesList.forEach(function (element) {
            var latlng = [];
            latlng.push(element[1]); // latitude
            latlng.push(element[0]); // longitude
            routeLatLngList.push(latlng);
          });

          var busStopList = response.data.stops;
          busStopList.forEach(function (element) {
            var busStopId = element + "";
            var busStopDetail = $scope.busStopMap[element];
            var busStopMarker = L.marker([Number(busStopDetail.lat), Number(busStopDetail.lng)]).addTo($scope.mymap);
            busStopMarker.bindPopup('<p>' + busStopDetail.name_mm + ',<br> ' + busStopDetail.road_mm + ',<br> ' + busStopDetail.twsp_mm + '</p>');
            $scope.selectedBusStops.push(busStopMarker);
          });

          // create a red polyline from an array of LatLng points
          var latlngs = [];
          latlngs.push(routeLatLngList);
          $scope.polyline = L.polyline(latlngs, { color: 'red' }).addTo($scope.mymap);
          // zoom the map to the polyline
          $scope.mymap.fitBounds($scope.polyline.getBounds());
        }

      }, function (error) {

      });
    };

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo($scope.mymap);
  }]);