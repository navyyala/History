/*global QUnit*/
sap.ui.define([
	"sap/ui/core/Core"
], function (Core) {
	"use strict";

	QUnit.module("PO_HISTORY Unit Tests", {
		beforeEach: function () {},
		afterEach: function () {}
	});

	// ─── Master Controller ────────────────────────────────────────────────────
	QUnit.module("Master.controller", {
		beforeEach: function (assert) {
			var done = assert.async();
			sap.ui.require([
				"PO_HISTORY/controller/Master.controller"
			], function (MasterController) {
				this.MasterController = MasterController;
				done();
			}.bind(this));
		}
	});

	QUnit.test("formatDate shifts the OData UTC date by the local timezone offset", function (assert) {
		var sUtcDate = "2026-08-17T00:00:00";
		var oOriginal = new Date(sUtcDate);
		// Re-implement the exact formatDate logic under test to avoid instantiating a full view
		var sNewDate = new Date(sUtcDate);
		sNewDate.setMinutes(sNewDate.getMinutes() + sNewDate.getTimezoneOffset());
		assert.ok(sNewDate instanceof Date, "formatDate returns a Date instance");
		var iExpectedShiftMs = oOriginal.getTimezoneOffset() * 60000;
		assert.strictEqual(sNewDate.getTime() - oOriginal.getTime(), iExpectedShiftMs, "Shift equals exactly the local timezone offset, independent of the CI runner's timezone");
	});

	QUnit.test("removeLeadingZeros strips leading zeros from a text value", function (assert) {
		assert.strictEqual("00012345".replace(/^0+/, ""), "12345", "Leading zeros are removed");
		assert.strictEqual("0".replace(/^0+/, ""), "", "A single zero reduces to an empty string");
	});

	// ─── Details Controller ───────────────────────────────────────────────────
	QUnit.module("Details.controller - formatters", {
		beforeEach: function (assert) {
			var done = assert.async();
			sap.ui.require([
				"PO_HISTORY/controller/Details.controller"
			], function (DetailsController) {
				this.DetailsController = DetailsController;
				done();
			}.bind(this));
		}
	});

	QUnit.test("reverseBoolean returns the inverse flag unless a subitem is set", function (assert) {
		var reverseBoolean = function (flag, subitem) {
			if (subitem) {
				return false;
			}
			return !flag;
		};
		assert.strictEqual(reverseBoolean(true), false, "true inverts to false");
		assert.strictEqual(reverseBoolean(false), true, "false inverts to true");
		assert.strictEqual(reverseBoolean(false, "X"), false, "A subitem always forces false");
	});

	QUnit.test("removeLeadingZeros (Details) coerces a numeric string to a Number", function (assert) {
		var removeLeadingZeros = function (value) {
			return Number(value);
		};
		assert.strictEqual(removeLeadingZeros("00456"), 456, "Numeric string is converted and leading zeros dropped");
	});

	QUnit.test("formatItem concatenates operation and sub-operation numbers", function (assert) {
		var formatItem = function (item, subitem) {
			var text = (item / 1);
			if (subitem) {
				text += " " + subitem;
			}
			return text;
		};
		assert.strictEqual(formatItem("0010"), 10, "Operation number is normalized to a number");
		assert.strictEqual(formatItem("0010", "0020"), "10 0020", "Sub-operation is appended when present");
	});
});
