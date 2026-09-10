sap.ui.define([
	"sap/ui/base/Object"
], function(BaseObject) {
   "use strict";

	/**
	 * Abstract class which generates files based on OData REST sources.
	 * 
	 * The implementing subclasses define which specific file type will be generated. 
	 * This class is not tuned for a maximum of performance but for easy extendability. 
	 * 
	 * @class
	 * @public
	 * @name com.utils.FileGenerator
	 */
	var FileGenerator = BaseObject.extend("PO_HISTORY.util.FileGenerator", {
   	
   		/**
   		 * @param {array} [aSkipAttributes] Array of attributes which will be skipped during file generation.
   		 *									This is useful to hide fields and metadata. If the parameter is null,
   		 *									only the default attribute "__metadata" will be skipped.
   		 * @public
   		 */
   		constructor: function(aSkipAttributes) {
   			/**
   			 * Array of attributes which will be skipped during file generation.
   			 * @private
   			 */
   			this._aSkipAttributes = aSkipAttributes || ["__metadata"];
   		},
   		
   		/**
   		 * Extracts the header row and applies the cell processor function on each label.
   		 * @param {array} aRows An array of rows. This is usually the result set from the OData response.
   		 * @param {function} fnCellProcessor Function which will be called on each data field. The function
   		 *									 will be given the data field as the only parameter.
   		 * @param {function} fnLineBreakProcessor Function which will be called after each row to handle any line breaks.
   		 * @private
   		 */
   		_extractHeader: function(aRows, fnCellProcessor, fnLineBreakProcessor) {
   			if (aRows.length > 0) {
   				this._deleteSkippedAttributes(aRows[0]);
   				Object.keys(aRows[0]).forEach(function(sHeader) {
   					fnCellProcessor(sHeader);
   				});
   				fnLineBreakProcessor();
   			}
   		},
   		
   		/**
   		 * Loops over each row in aRows and applies the cell processor function on each data cell.
   		 * The first row in aRows is treated as the column header. 
   		 * @param {array} aRows An array of rows. This is usually the result set from the OData response.
   		 * @param {function} fnCellProcessor Function which will be called on each data field. The function
   		 *									 will be given the data field as the only parameter.
   		 * @param {function} fnLineBreakProcessor Function which will be called after each row to handle any line breaks.
   		 * @protected
   		 */
   		loopDataRows: function(aRows, fnCellProcessor, fnLineBreakProcessor) {
   			var self = this;
   			
   			this._extractHeader(aRows, fnCellProcessor, fnLineBreakProcessor);
			
   			aRows.forEach(function(oRow) {
   				// Remove unwanted attributes
   				self._deleteSkippedAttributes(oRow);
   				// Process each data cell (key, value)
   				Object.keys(oRow).forEach(function(sKey) {
   					// Processor can now use the cell value to create a file
					fnCellProcessor(self._sanitizeCellValue(oRow[sKey]));
				});
				// Allow to handle line breaks
   				fnLineBreakProcessor();
   			});
   		},
   
   		 /**
   		 * Sanitizes the cell value by ignoring objects and only handling primitve value types.
   		 * @param sCell The cell value to sanitize
   		 * @return {string} Returns the parameter value if it is a string otherwise the empty string will be returend.
   		 * @private
   		 */
   		_sanitizeCellValue: function(sCell) {
   			return sCell === undefined || sCell === null || typeof sCell === "object" ? "" : sCell;
   		},
   		
   		/**
   		 * Deletes every key of the skipAttributes member from the oRow.
   		 * @param {object} oRow A single row (object) of the result set.
   		 * @private
   		 */
   		_deleteSkippedAttributes: function(oRow) {
   			this._aSkipAttributes.forEach(function(oAttribute) {
   				delete oRow[oAttribute];
   			});
   		}
   		
   		/**
		 * Generates a file (type specified by the subclass) from the odata result set.
		 * 
		 * @param {array} aRows An array of rows. This is usually the result set from the OData response.
		 * @name com.utils.FileGenerator.prototype.generate
		 * @function
		 * @public
		 */

		/**
		 * Triggers a download from the browser to the generated file.
		 * 
		 * @param {string} sFilename Filename of the download.
		 * @name com.utils.FileGenerator.prototype.download
		 * @function
		 * @public
		 */
 
   });
   
   return FileGenerator;
});
