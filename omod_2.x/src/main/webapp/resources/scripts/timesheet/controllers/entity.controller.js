/*
 * The contents of this file are subject to the OpenMRS Public License
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://license.openmrs.org
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and
 * limitations under the License.
 *
 * Copyright (C) OpenHMIS.  All Rights Reserved.
 *
 */

(function () {
	'use strict';
	
	var base = angular.module('app.genericEntityController');
	base.controller("TimesheetController", TimesheetController);
	TimesheetController.$inject = ['$stateParams', '$injector', '$scope', '$filter', 'EntityRestFactory', 'TimesheetModel',
		'TimesheetRestfulService', 'TimesheetFunctions'];
	
	function TimesheetController($stateParams, $injector, $scope, $filter, EntityRestFactory, TimesheetModel,
	                             TimesheetRestfulService, TimesheetFunctions) {
		var self = this;

		var module_name = 'cashier';
		var entity_name_message_key = emr.message("openhmis.cashier.page.timesheet");
		var rest_entity_name = emr.message("openhmis.cashier.page.timesheet.rest_name");
		var cancel_page = '#';

		// @Override
		self.setRequiredInitParameters = self.setRequiredInitParameters
			|| function () {
				self.bindBaseParameters(module_name, rest_entity_name,
					entity_name_message_key, cancel_page);
			}
		
		/**
		 * Initializes and binds any required variable and/or function specific to entity.page
		 * @type {Function}
		 */
		// @Override
		self.bindExtraVariablesToScope = self.bindExtraVariablesToScope
			|| function (uuid) {
				self.loadCashpoints();
				self.loadCurrentTimesheets();
				self.loadCurrentProvider();
				
				$scope.loadClockOutTime = function () {
					if ($scope.timesheets != null && $scope.timesheets.clockOut == null) {
						$scope.clockOut = TimesheetFunctions.formatDate(new Date);
					}
				}

				$scope.loadClockInTime = function () {
					$scope.clockIn = TimesheetFunctions.formatDate(new Date());
				}
				
				$scope.loadReportTimesheets = function () {
					var shiftDate = angular.element(document.getElementById('shiftDate-display').val);
					console.log(shiftDate);
				}
				
				TimesheetFunctions.onChangeDatePicker('shiftDate-display',
					self.onTimesheetShiftReportDateSuccessCallback);

			};
		
		/**
		 * All post-submit validations are done here.
		 * @return boolean
		 */
		self.onTimesheetShiftReportDateSuccessCallback = self.onTimesheetShiftReportDateSuccessCallback || function (data) {
				var selectedReportDate = TimesheetFunctions.formatDate(data);
				TimesheetRestfulService.loadTimesheet(module_name, self.onLoadSelectedReportDateTimesheetSuccessful, selectedReportDate);
			}

		self.onLoadSelectedReportDateTimesheetSuccessful  = self.onLoadSelectedReportDateTimesheetSuccessful || function (data) {
				$scope.selectedDatesReports = data.results;
				if (data.results == null) {

				}
			}

		self.loadCashpoints = self.loadCashpoints || function () {
				TimesheetRestfulService.loadCashpoints(module_name, self.onLoadCashpointsSuccessful);
			}
		self.loadCurrentProvider = self.loadCurrentProvider || function () {
				TimesheetRestfulService.loadProvider(module_name, self.onLoadProviderSuccessful);
			}
		self.loadCurrentTimesheets = self.loadCurrentTimesheets || function () {
				var timesheetDate = TimesheetFunctions.formatDate(new Date());
				TimesheetRestfulService.loadTimesheet(module_name, self.onloadCurrentTimesheetSuccessful, timesheetDate);
			}
		
		//callback
		self.onLoadCashpointsSuccessful = self.onLoadCashpointsSuccessful || function (data) {
				$scope.cashpoints = data.results;
			}

		self.onLoadProviderSuccessful = self.onLoadProviderSuccessful || function (data) {
				$scope.cashier = data.currentProvider.uuid;
			}

		self.onloadCurrentTimesheetSuccessful = self.onloadCurrentTimesheetSuccessful || function (data) {
				$scope.timesheets = data.results[0];
				/*Get the latest timesheet for the day if multiple exist*/
				if ($scope.timesheets) {
					//check if the timesheet exists and has a clockOut time filled
					if ($scope.timesheets.clockOut != null) {
						$scope.clockIn = TimesheetFunctions.formatDate(new Date);
						$scope.showClockOutSection = TimesheetFunctions.formatDate(new Date(data.results[0].clockOut));
						$scope.clockOut = "";
					} else {
						$scope.clockIn = TimesheetFunctions.formatDate(new Date(data.results[0].clockIn));
						$scope.clockOut = "";
						$scope.showClockOutSection = "";
						$scope.entity.cashPoint = data.results[0].cashPoint;
						$scope.entity.uuid = data.results[0].uuid;
						$scope.entity.id = data.results[0].id;
					}
				} else {
					$scope.clockIn = TimesheetFunctions.formatDate(new Date());
					$scope.showClockOutSection = "";
				}
			}
		
		// @Override
		self.validateBeforeSaveOrUpdate = self.validateBeforeSaveOrUpdate || function () {
				$scope.submitted = false;
					if (!angular.isDefined($scope.clockOut) || $scope.clockOut == "") {
						$scope.entity.clockOut = null;
						emr.successAlert(emr.message("openhmis.cashier.page.timesheet.box.clockIn.message"));
					} else {
						$scope.entity.clockOut = TimesheetFunctions.convertToDate($scope.clockOut);
						emr.successAlert(emr.message("openhmis.cashier.page.timesheet.box.clockOut.message"));
					}

					/**
					 * Performs checks to either get the current logged in cashier
					 * or the cashier the started the timesheet.
					 * */
					if ($scope.timesheets) {
						if ($scope.timesheets.clockOut != null) {
							$scope.entity.cashier = $scope.cashier;
						} else {
							$scope.entity.cashier = $scope.timesheets.cashier;
						}
					} else {
						$scope.entity.cashier = $scope.cashier;
					}

					$scope.entity.clockIn = TimesheetFunctions.convertToDate($scope.clockIn);
				return true;
			}
		
		/* ENTRY POINT: Instantiate the base controller which loads the page */
		$injector.invoke(base.GenericEntityController, self, {
			$scope: $scope,
			$filter: $filter,
			$stateParams: $stateParams,
			EntityRestFactory: EntityRestFactory,
			GenericMetadataModel: TimesheetModel
		});
	}
})();
