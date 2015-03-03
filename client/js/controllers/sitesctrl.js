function SitesCtrl ($scope, $rootScope, $alert, $aside, Api) {
    var vm = this;
    vm.myAside = null;
    vm.showAside = showAside;
    vm.loading = false;
    vm.sites = [];
    vm.site = null;
    vm.getParams = getParams;
    vm.calcSiteParams = calcSiteParams;
    vm.selectParam = selectParam;
    vm.data = {};


    vm.options = {
        chart: {
            type: 'lineChart',
            height: '350',
            x: function(d){ return d[0]; },
            y: function(d){ return d[1]; },
            xAxis: {
                axisLabel: 'Место в выдаче'
            },
            yAxis: {
                axisLabel: 'Значение параметра',
                tickFormat: function(d){
                    return d3.format('.02f')(d);
                },
                axisLabelDistance: 30
            }
        }
    }

    $scope.$watch('vm.site', function(current, original) {
        console.log("clear");


    });

    load();


    function showAside(){
        if (vm.myAside){
//            console.log("OLD");
            vm.myAside.show();
        } else{
            if (vm.sites && vm.sites.length){
                //            console.log("NEW");
                var scope = $rootScope.$new();
                scope.sites = vm.sites;
                scope.nodeselect = selectSite;
                vm.myAside = $aside({scope: scope, show: true,
                    placement: "left", animation: "fade-and-slide-left",
                    template: 'partials/sites_aside_template.html'});
            }

        }

    }

    function selectSite(node) {
//        console.log("selectSite", node);
        if (node.type == 'task'){
            vm.site = node;
            if (vm.myAside){
                vm.myAside.hide();
            }
            vm.getParams();
        }

    }

    function selectParam(node) {
//        console.log("selectParam", node);
        if (node.type == 'key'){
            vm.data.chartValue = node.data.values;
        }

    }

    function load () {
        vm.loading = true;
        Api.user_sites_and_tasks()
            .then(function (res) {
                console.log("load Api.user_sites_and_tasks ", res);
                vm.sites = res.data;
                vm.loading = false;
                vm.showAside();
            })
            .catch(function (err) {
                console.log('load Api.user_sites_and_tasks ', err);
                vm.sites = [];
                vm.loading = false;
                $alert({title: 'Внимание!', content: "Ошибка при получении списка сайтов"
                    + (err.data ? ": " + err.data : "!"),
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
            });
    };


    function getParams() {
        if (!vm.site){
            return;
        }
        vm.loading = true;

        vm.data = {};
        return Api.get_params(vm.site.data.url_id, vm.site.data.condition_id)
            .then(function (res) {
                console.log("getParams Api.get_params", res);

//                vm.site_params = res.data.site_params[0];

                vm.data.chart = res.data.paramsDiagram;
                vm.data.sitesParams = res.data.paramsTable;
                vm.data.position = res.data.paramsPosition;
                vm.data.searchDate = res.data.searchDate;
                vm.data.siteUpdateDate = res.data.siteUpdateDate;

                vm.loading = false;
            })
            .catch(function (err) {
                console.log('getParams Api.get_params ', err);
                vm.loading = false;

                $alert({title: 'Внимание!', content: "Параметры не получены: " + err.data,
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
            })
    }

    function calcSiteParams() {
        if (!vm.site) {
            return;
        }
        vm.loading = true;

        Api.calc_site_params(vm.site.data.url, vm.site.data.condition_id)
//        Api.calc_site_params(vm.site.data.url, vm.site.data.condition_id)
            .catch(function (err) {
                console.log("calcSiteParams Api.calc_site_params ", err)
                $alert({title: 'Внимание!', content: "Параметры страницы не пересчитаны "
                        + (err.data ? ": " + err.data : "!"),
                    placement: 'top', type: 'danger', show: true,
                    duration: '3',
                    container: '.alerts-container'
                });
            })
            .then(function (res) {
                console.log("calcSiteParams Api.calc_site_params", res);
                vm.loading = false;
                vm.getParams();
            })
        }
    }

angular.module('seoControllers').controller('SitesCtrl', SitesCtrl);
