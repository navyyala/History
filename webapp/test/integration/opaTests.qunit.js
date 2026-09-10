/*global QUnit, opaTest*/
sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText"
], function (Opa5, opaTest, Press, EnterText) {
	"use strict";

	var sComponentUrl = "../../index.html";

	Opa5.extendConfig({
		timeout: 30,
		pollingInterval: 400,
		viewNamespace: "PO_HISTORY.view."
	});

	// ─── Arrangements ────────────────────────────────────────────────────────
	var oArrangements = new Opa5({
		iStartMyApp: function () {
			return this.iStartMyAppInAFrame(sComponentUrl);
		}
	});

	// ─── Actions ─────────────────────────────────────────────────────────────
	var oActions = new Opa5({
		iEnterASearchTerm: function (sSearchText) {
			return this.waitFor({
				id: "searchField",
				viewName: "Master",
				actions: new EnterText({ text: sSearchText }),
				success: function () { QUnit.assert.ok(true, "Search field found and text entered"); },
				errorMessage: "Search field not found in Master view"
			});
		},
		iPressTheGoButton: function () {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: function (oButton) {
					return oButton.getText && oButton.getBindingPath && !!oButton.getId().length;
				},
				viewName: "Master",
				success: function (aButtons) {
					// The Go button's press handler is "onGoPressed"; match by that instead of by text/i18n key.
					var oGoButton = aButtons.filter(function (oButton) {
						return oButton.mEventRegistry && oButton.mEventRegistry.press &&
							oButton.mEventRegistry.press.some(function (oHandler) {
								return oHandler.fFunction && oHandler.fFunction.name === "onGoPressed";
							});
					})[0];
					new Press().executeOn(oGoButton || aButtons[0]);
					QUnit.assert.ok(true, "Go button pressed");
				},
				errorMessage: "Go button not found in Master view"
			});
		},
		iPressTheResetButton: function () {
			return this.waitFor({
				controlType: "sap.m.Button",
				viewName: "Master",
				matchers: function (oButton) {
					return oButton.mEventRegistry && oButton.mEventRegistry.press &&
						oButton.mEventRegistry.press.some(function (oHandler) {
							return oHandler.fFunction && oHandler.fFunction.name === "onResetPressed";
						});
				},
				actions: new Press(),
				success: function () { QUnit.assert.ok(true, "Reset button pressed"); },
				errorMessage: "Reset button not found in Master view"
			});
		},
		iPressTheFirstOrderInTheList: function () {
			return this.waitFor({
				id: "catalogTable",
				viewName: "Master",
				matchers: function (oTable) {
					return oTable.getItems().length > 0;
				},
				actions: function (oTable) {
					new Press().executeOn(oTable.getItems()[0]);
				},
				success: function () { QUnit.assert.ok(true, "First order row pressed"); },
				errorMessage: "No rows found in the order history table"
			});
		}
	});

	// ─── Assertions ──────────────────────────────────────────────────────────
	var oAssertions = new Opa5({
		iShouldSeeTheOrderListPage: function () {
			return this.waitFor({
				id: "orderListPage",
				viewName: "Master",
				success: function (oPage) {
					QUnit.assert.ok(oPage, "The order history (Master) list page is shown");
				},
				errorMessage: "Did not find the order history list page"
			});
		},
		iShouldSeeTheDetailsPage: function () {
			return this.waitFor({
				id: "DetailsPage",
				viewName: "Details",
				success: function (oPage) {
					QUnit.assert.ok(oPage, "Navigation to the order Details page succeeded");
				},
				errorMessage: "Did not navigate to the order Details page"
			});
		}
	});

	Opa5.extendConfig({
		arrangements: oArrangements,
		actions: oActions,
		assertions: oAssertions
	});

	QUnit.module("PO_HISTORY - Routing, Search & Navigation");

	opaTest("Should load the app and show the order history list (Master route)", function (Given, When, Then) {
		Given.iStartMyApp();
		Then.iShouldSeeTheOrderListPage();
	});

	opaTest("Should filter the list when a search term is entered and Go is pressed", function (Given, When, Then) {
		When.iEnterASearchTerm("100000");
		When.iPressTheGoButton();
		Then.iShouldSeeTheOrderListPage();
	});

	opaTest("Should reset all filters when Reset is pressed", function (Given, When, Then) {
		When.iPressTheResetButton();
		Then.iShouldSeeTheOrderListPage();
	});

	opaTest("Should navigate to the Details route when an order row is pressed", function (Given, When, Then) {
		When.iPressTheFirstOrderInTheList();
		Then.iShouldSeeTheDetailsPage();
		Then.iTeardownMyApp();
	});
});
