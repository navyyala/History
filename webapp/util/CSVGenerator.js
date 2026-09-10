sap.ui.define([
	"PO_HISTORY/util/FileGenerator"
], function(
	FileGenerator
) {
	"use strict";

	/**
	 * Creates a CSV file from an OData result set.
	 * 
	 * @class
	 * @public
	 * @name com.utils.CSVGenerator
	 */
	var CSVGenerator =  FileGenerator.extend("PO_HISTORY.util.CSVGenerator", {

		/**
		 * @param {string} [sEscape] Escape symbol which is used to wrap each data field. Default is ".
		 * @param {string} [sSeparator] Data field separator symbol. Default is ";".
		 * @param {string} [sLinebreak] Line break symbol. Default is '\r\n'.
		 * @public 
		 */
		constructor: function(sEscape, sSeparator, sLinebreak) {
			FileGenerator.call(this);
			
			this._sOutput = undefined;
			this._sEscape = sEscape || '"';
			this._sSeparator = sSeparator || ";";
			this._sLinebreak = sLinebreak || '\r\n';
		},
		
		/**
		 * Appends the value to the output field. Separator and escape symbols are applied.
		 * @param {string} sValue The value of the data field.
		 * @private
		 */
		_processCell: function(sValue) {
			this._sOutput += this._sEscape + sValue + this._sEscape + this._sSeparator;
		},
		
		/**
		 * Appends the line break symbol to the output.
		 * @private
		 */
		_processLineBreak: function() {
			this._sOutput += this._sLinebreak;
		},

		/**
		 * Generates a CSV file from the odata result set.
		 * 
		 * @param {array} aRows An array of rows. This is usually the result set from the OData response.
		 *						The result set may be modified by this function.
		 * @public
		 */
		generate: function(aRows) {
			this._sOutput = "";
			
			// In parent object
			this.loopDataRows(aRows, this._processCell.bind(this), this._processLineBreak.bind(this));
		},
		
		getCsvRows: function() {
			return this._sOutput;
		},

		/**
		 * Triggers a download from the browser to the generated file.
		 * This is done by placing a hidden link in the DOM and triggering a click event on it.
		 * After the download the link is removed again.
		 * Ensure that the generate function has been called before, otherwise the download will not work.
		 * 
		 * @param {string} sFilename Filename of the download.
		 * @public
		 */
		download: function(sFilename) {
			if (this._sOutput !== undefined) {
				var oLink = document.createElement("a");
				oLink.href = "data:text/csv;charset=utf-8," + escape(this._sOutput);
	
				oLink.style = "visibility:hidden";
				oLink.download = sFilename + ".csv";
	
				document.body.appendChild(oLink);
				// parent.window.open(oLink, '_blank');
				oLink.click();
				document.body.removeChild(oLink);
			}
		}

	});
	
	return CSVGenerator;
});
