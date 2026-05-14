// Copyright 2024. CCC14S4 Visualization
// Coordinate Compression and Diff Array for CCC14S4 Problem

function CCC14S4(am, w, h)
{
	//this.init(am, w, h);
	this.init(am, w, 700);
}

CCC14S4.prototype = new Algorithm();
CCC14S4.prototype.constructor = CCC14S4;
CCC14S4.superclass = Algorithm.prototype;

CCC14S4.TABLE_ELEM_WIDTH = 25;
CCC14S4.TABLE_ELEM_HEIGHT = 25;

// Three table positions
CCC14S4.BRUTE_TABLE_START_X = 220;
CCC14S4.BRUTE_TABLE_START_Y = 70;

CCC14S4.COMPRESSED_TABLE_START_X = 800;
CCC14S4.COMPRESSED_TABLE_START_Y = 70;

CCC14S4.DIFF_TABLE_START_X = 800;
CCC14S4.DIFF_TABLE_START_Y = 320;

CCC14S4.CODE_START_X = 20;
CCC14S4.CODE_START_Y = 20;
CCC14S4.CODE_LINE_HEIGHT = 14;

CCC14S4.MAX_RECTANGLES = 5;
CCC14S4.MESSAGE_ID = 0;

CCC14S4.prototype.init = function(am, w, h)
{
	CCC14S4.superclass.init.call(this, am, w, h);
	this.nextIndex = 0;
	this.addControls();
	
	// Hardcoded test data
	this.code = [
		["N = 4"],
		["T = 2"],
		["Rectangles:"],
		["  x1 y1 x2 y2  t:"],
		["   0  0  10 10 1"],
		["   5  5  15 15 1"],
		["10 10  20 18 1"],
		["   2  2  18 12 1"]
	];
	
	this.codeID = Array(this.code.length);
	var i, j;
	for (i = 0; i < this.code.length; i++)
	{
		this.codeID[i] = new Array(this.code[i].length);
		for (j = 0; j < this.code[i].length; j++)
		{
			this.codeID[i][j] = this.nextIndex++;
			this.cmd("CreateLabel", this.codeID[i][j], this.code[i][j], CCC14S4.CODE_START_X, CCC14S4.CODE_START_Y + i * CCC14S4.CODE_LINE_HEIGHT, 0);
			this.cmd("SetForegroundColor", this.codeID[i][j], "#000000");
			if (j > 0)
			{
				this.cmd("AlignRight", this.codeID[i][j], this.codeID[i][j-1]);
			}
		}
	}
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.initialIndex = this.nextIndex;
	this.oldIDs = [];
	this.commands = [];
}

CCC14S4.prototype.addControls = function()
{
	this.controls = [];

	this.runButton = addControlToAlgorithmBar("Button", "Run Animation");
	this.runButton.onclick = this.runCallback.bind(this);
	this.controls.push(this.runButton);
}

CCC14S4.prototype.emptyCallback = function(event)
{
	this.implementAction(this.helpMessage.bind(this), "");
}

CCC14S4.prototype.runCallback = function(event)
{
	this.implementAction(this.runAnimation.bind(this), "");
}

CCC14S4.prototype.helpMessage = function(value)
{
	this.commands = [];
	this.clearOldIDs();
	
	var messageID = this.nextIndex++;
	this.oldIDs.push(messageID);
	this.cmd("CreateLabel", messageID,
		"Enter N (number of rectangles), T (threshold), and rectangles.\n" +
		"Format: x1 y1 x2 y2 t (semicolon separated for multiple rectangles).\n" +
		"Example: 0 0 3 3 1;1 1 4 4 2",
		CCC14S4.CODE_START_X, CCC14S4.CODE_START_Y + 50, 0);
	return this.commands;
}

CCC14S4.prototype.clearOldIDs = function()
{
	for (var i = 0; i < this.oldIDs.length; i++)
	{
		this.cmd("Delete", this.oldIDs[i]);
	}
	this.oldIDs = [];
	this.nextIndex = this.initialIndex;
}

CCC14S4.prototype.reset = function()
{
	this.oldIDs = [];
	this.nextIndex = this.initialIndex;
}

CCC14S4.prototype.runAnimation = function(value)
{
	this.commands = [];
	this.clearOldIDs();
	
	// Hardcoded test data
	var N = 4;
	var T = 2;
	var rectangles = [
		{x1: 0, y1: 0, x2: 10, y2: 10, t: 1},
		{x1: 5, y1: 5, x2: 15, y2: 15, t: 1},
		{x1: 10, y1: 10, x2: 20, y2: 18, t: 1},
		{x1: 2, y1: 2, x2: 18, y2: 12, t: 1}
	];
	
	// Recreate code display labels (they were deleted by clearOldIDs)
	for (var i = 0; i < this.code.length; i++)
	{
		for (var j = 0; j < this.code[i].length; j++)
		{
			this.codeID[i][j] = this.nextIndex++;
			this.cmd("CreateLabel", this.codeID[i][j], this.code[i][j], CCC14S4.CODE_START_X, CCC14S4.CODE_START_Y + i * CCC14S4.CODE_LINE_HEIGHT, 0);
			this.cmd("SetForegroundColor", this.codeID[i][j], "#000000");
			if (j > 0)
			{
				this.cmd("AlignRight", this.codeID[i][j], this.codeID[i][j-1]);
			}
		}
	}
	
	// Create title labels
	var bruteTitle = this.nextIndex++;
	this.oldIDs.push(bruteTitle);
	this.cmd("CreateLabel", bruteTitle, "Brute Force Table", 
		CCC14S4.BRUTE_TABLE_START_X + 150, CCC14S4.BRUTE_TABLE_START_Y - 60, 0);
	this.cmd("SetForegroundColor", bruteTitle, "#0000FF");
	
	var compressedTitle = this.nextIndex++;
	this.oldIDs.push(compressedTitle);
	this.cmd("CreateLabel", compressedTitle, "Coordinate Compressed", 
		CCC14S4.COMPRESSED_TABLE_START_X + 40, CCC14S4.COMPRESSED_TABLE_START_Y - 50, 0);
	this.cmd("SetForegroundColor", compressedTitle, "#009900");
	
	var diffTitle = this.nextIndex++;
	this.oldIDs.push(diffTitle);
	this.cmd("CreateLabel", diffTitle, "Diff Array", 
		CCC14S4.DIFF_TABLE_START_X + 70, CCC14S4.DIFF_TABLE_START_Y - 50, 0);
	this.cmd("SetForegroundColor", diffTitle, "#990000");
	
	// Calculate coordinate range for brute force table
	var minX = 1000, maxX = 0, minY = 1000, maxY = 0;
	for (var i = 0; i < rectangles.length; i++)
	{
		minX = Math.min(minX, rectangles[i].x1);
		maxX = Math.max(maxX, rectangles[i].x2);
		minY = Math.min(minY, rectangles[i].y1);
		maxY = Math.max(maxY, rectangles[i].y2);
	}
	
	var bruteWidth = maxX + 1//maxX - minX + 1;
	var bruteHeight = maxY + 1//maxY - minY + 1;
	
	// Build brute force table with full index range
	this.bruteTableID = new Array(bruteHeight);
	this.bruteTableVals = new Array(bruteHeight);
	
	// Add column indices for brute force table (showing actual coordinates)
	for (var j = 0; j < bruteWidth; j++)
	{
		var colIndexID = this.nextIndex++;
		this.oldIDs.push(colIndexID);
		this.cmd("CreateLabel", colIndexID, j,
			CCC14S4.BRUTE_TABLE_START_X + j * CCC14S4.TABLE_ELEM_WIDTH,
			CCC14S4.BRUTE_TABLE_START_Y - CCC14S4.TABLE_ELEM_HEIGHT);
		this.cmd("SetForegroundColor", colIndexID, "#0000FF");
	}
	
	// Add row indices for brute force table (showing actual coordinates)
	for (var i = 0; i < bruteHeight; i++)
	{
		var rowIndexID = this.nextIndex++;
		this.oldIDs.push(rowIndexID);
		this.cmd("CreateLabel", rowIndexID, i,
			CCC14S4.BRUTE_TABLE_START_X - CCC14S4.TABLE_ELEM_WIDTH,
			CCC14S4.BRUTE_TABLE_START_Y + i * CCC14S4.TABLE_ELEM_HEIGHT);
		this.cmd("SetForegroundColor", rowIndexID, "#0000FF");
	}
	
	for (var i = 0; i < bruteHeight; i++)
	{
		this.bruteTableID[i] = new Array(bruteWidth);
		this.bruteTableVals[i] = new Array(bruteWidth);
		for (var j = 0; j < bruteWidth; j++)
		{
			this.bruteTableID[i][j] = this.nextIndex++;
			this.oldIDs.push(this.bruteTableID[i][j]);
			this.bruteTableVals[i][j] = 0;
			
			this.cmd("CreateRectangle", this.bruteTableID[i][j], 
				"0",
				CCC14S4.TABLE_ELEM_WIDTH,
				CCC14S4.TABLE_ELEM_HEIGHT,
				CCC14S4.BRUTE_TABLE_START_X + j * CCC14S4.TABLE_ELEM_WIDTH,
				CCC14S4.BRUTE_TABLE_START_Y + i * CCC14S4.TABLE_ELEM_HEIGHT);
		}
	}
	
	// Coordinate compression
	var xs = [];
	var ys = [];
	for (var i = 0; i < rectangles.length; i++)
	{
		xs.push(rectangles[i].x1);
		xs.push(rectangles[i].x2);
		ys.push(rectangles[i].y1);
		ys.push(rectangles[i].y2);
	}
	xs.sort(function(a, b) { return a - b; });
	ys.sort(function(a, b) { return a - b; });
	
	// Remove duplicates
	var uniqueXs = [];
	var uniqueYs = [];
	for (var i = 0; i < xs.length; i++)
	{
		if (i === 0 || xs[i] !== xs[i-1]) uniqueXs.push(xs[i]);
	}
	for (var i = 0; i < ys.length; i++)
	{
		if (i === 0 || ys[i] !== ys[i-1]) uniqueYs.push(ys[i]);
	}
	
	var mapX = {};
	var mapY = {};
	for (var i = 0; i < uniqueXs.length; i++)
	{
		mapX[uniqueXs[i]] = i;
	}
	for (var i = 0; i < uniqueYs.length; i++)
	{
		mapY[uniqueYs[i]] = i;
	}
	
	var nx = uniqueXs.length;
	var ny = uniqueYs.length;
	
	// Build coordinate compressed table
	this.compressedTableID = new Array(ny);
	this.compressedTableVals = new Array(ny);
	
	// Add column indices for compressed table (showing original coordinates)
	for (var j = 0; j < nx; j++)
	{
		var colIndexID = this.nextIndex++;
		this.oldIDs.push(colIndexID);
		this.cmd("CreateLabel", colIndexID, "" + j + "\n" + "(" + uniqueXs[j] + ")",
			CCC14S4.COMPRESSED_TABLE_START_X + j * CCC14S4.TABLE_ELEM_WIDTH,
			CCC14S4.COMPRESSED_TABLE_START_Y - CCC14S4.TABLE_ELEM_HEIGHT*1.1);
		this.cmd("SetForegroundColor", colIndexID, "#009900");
	}
	
	// Add row indices for compressed table (showing original coordinates)
	for (var i = 0; i < ny; i++)
	{
		var rowIndexID = this.nextIndex++;
		this.oldIDs.push(rowIndexID);
		this.cmd("CreateLabel", rowIndexID, "" + i + "(" + uniqueYs[i] + ")",
			CCC14S4.COMPRESSED_TABLE_START_X - CCC14S4.TABLE_ELEM_WIDTH,
			CCC14S4.COMPRESSED_TABLE_START_Y + i * CCC14S4.TABLE_ELEM_HEIGHT);
		this.cmd("SetForegroundColor", rowIndexID, "#009900");
	}
	
	for (var i = 0; i < ny; i++)
	{
		this.compressedTableID[i] = new Array(nx);
		this.compressedTableVals[i] = new Array(nx);
		for (var j = 0; j < nx; j++)
		{
			this.compressedTableID[i][j] = this.nextIndex++;
			this.oldIDs.push(this.compressedTableID[i][j]);
			this.compressedTableVals[i][j] = 0;
			
			this.cmd("CreateRectangle", this.compressedTableID[i][j], 
				"0",
				CCC14S4.TABLE_ELEM_WIDTH,
				CCC14S4.TABLE_ELEM_HEIGHT,
				CCC14S4.COMPRESSED_TABLE_START_X + j * CCC14S4.TABLE_ELEM_WIDTH,
				CCC14S4.COMPRESSED_TABLE_START_Y + i * CCC14S4.TABLE_ELEM_HEIGHT);
		}
	}
	
	// Build diff array table
	this.diffTableID = new Array(ny);
	this.diffTableVals = new Array(ny);
	
	// Add column indices for diff table (showing compressed indices)
	for (var j = 0; j <= nx; j++)
	{
		var colIndexID = this.nextIndex++;
		this.oldIDs.push(colIndexID);
		var colLabel = (j < nx) ? j : "end";
		this.cmd("CreateLabel", colIndexID, colLabel,
			CCC14S4.DIFF_TABLE_START_X + j * CCC14S4.TABLE_ELEM_WIDTH,
			CCC14S4.DIFF_TABLE_START_Y - CCC14S4.TABLE_ELEM_HEIGHT);
		this.cmd("SetForegroundColor", colIndexID, "#990000");
	}
	
	// Add row indices for diff table (showing compressed indices)
	for (var i = 0; i < ny; i++)
	{
		var rowIndexID = this.nextIndex++;
		this.oldIDs.push(rowIndexID);
		this.cmd("CreateLabel", rowIndexID, i,
			CCC14S4.DIFF_TABLE_START_X - CCC14S4.TABLE_ELEM_WIDTH,
			CCC14S4.DIFF_TABLE_START_Y + i * CCC14S4.TABLE_ELEM_HEIGHT);
		this.cmd("SetForegroundColor", rowIndexID, "#990000");
	}
	
	for (var i = 0; i < ny; i++)
	{
		this.diffTableID[i] = new Array(nx + 1);
		this.diffTableVals[i] = new Array(nx + 1);
		for (var j = 0; j <= nx; j++)
		{
			this.diffTableID[i][j] = this.nextIndex++;
			this.oldIDs.push(this.diffTableID[i][j]);
			this.diffTableVals[i][j] = 0;
			
			this.cmd("CreateRectangle", this.diffTableID[i][j], 
				"0",
				CCC14S4.TABLE_ELEM_WIDTH,
				CCC14S4.TABLE_ELEM_HEIGHT,
				CCC14S4.DIFF_TABLE_START_X + j * CCC14S4.TABLE_ELEM_WIDTH,
				CCC14S4.DIFF_TABLE_START_Y + i * CCC14S4.TABLE_ELEM_HEIGHT);
		}
	}
	
	this.cmd("Step");
	
	// Display current rectangle info
	var currentRectLabelID = this.nextIndex++;
	this.oldIDs.push(currentRectLabelID);
	this.cmd("CreateLabel", currentRectLabelID, "",
		CCC14S4.BRUTE_TABLE_START_X + 150, CCC14S4.BRUTE_TABLE_START_Y + 500, 0);
	this.cmd("SetForegroundColor", currentRectLabelID, "#FF6600");
	
	// Animate each rectangle
	for (var r = 0; r < rectangles.length; r++)
	{
		var rect = rectangles[r];
		
		// Highlight current rectangle in code display, + 4 since code[4] start data
		this.cmd("SetForegroundColor", this.codeID[r + 4][0], "#FF0000");
		this.cmd("Step");
		
		// Update current rectangle display
		this.cmd("SetText", currentRectLabelID, 
			"Processing Rectangle " + (r + 1) + ": (" + rect.x1 + "," + rect.y1 + ") to (" + rect.x2 + "," + rect.y2 + ") tint=" + rect.t);
		this.cmd("Step");
		
		// Update brute force table (using offset coordinates)
		// First highlight all cells in the rectangle region
		for (var i = rect.y1; i < rect.y2; i++)
		{
			for (var j = rect.x1; j < rect.x2; j++)
			{
				var tableI = i;
				var tableJ = j;
				if (tableI >= 0 && tableI < bruteHeight && tableJ >= 0 && tableJ < bruteWidth)
				{
					this.bruteTableVals[tableI][tableJ] += rect.t;
					this.cmd("SetHighlight", this.bruteTableID[tableI][tableJ], 1);
					this.cmd("SetForegroundColor", this.bruteTableID[tableI][tableJ], "#FF6600");
					this.cmd("SetText", this.bruteTableID[tableI][tableJ], this.bruteTableVals[tableI][tableJ]);
				}
			}
		}
		this.cmd("Step");
		// Then unhighlight all cells
		for (var i = rect.y1; i < rect.y2; i++)
		{
			for (var j = rect.x1; j < rect.x2; j++)
			{
				var tableI = i;
				var tableJ = j;
				if (tableI >= 0 && tableI < bruteHeight && tableJ >= 0 && tableJ < bruteWidth)
				{
					this.cmd("SetForegroundColor", this.bruteTableID[tableI][tableJ], "#000000");
					this.cmd("SetHighlight", this.bruteTableID[tableI][tableJ], 0);
				}
			}
		}
		
		// Unhighlight current rectangle in code display
		this.cmd("SetForegroundColor", this.codeID[r + 3][0], "#000000");
		
		// Update coordinate compressed table
		var i1 = mapX[rect.x1];
		var i2 = mapX[rect.x2];
		var j1 = mapY[rect.y1];
		var j2 = mapY[rect.y2];
		
		// First highlight all cells in the rectangle region
		for (var j = j1; j < j2; j++)
		{
			for (var i = i1; i < i2; i++)
			{
				this.compressedTableVals[j][i] += rect.t;
				this.cmd("SetHighlight", this.compressedTableID[j][i], 1);
				this.cmd("SetForegroundColor", this.compressedTableID[j][i], "#FF6600");
				this.cmd("SetText", this.compressedTableID[j][i], this.compressedTableVals[j][i]);
			}
		}
		this.cmd("Step");
		// Then unhighlight all cells
		for (var j = j1; j < j2; j++)
		{
			for (var i = i1; i < i2; i++)
			{
				this.cmd("SetForegroundColor", this.compressedTableID[j][i], "#000000");
				this.cmd("SetHighlight", this.compressedTableID[j][i], 0);
			}
		}
		
		// Update diff array
		// First highlight all cells in the rectangle region
		for (var j = j1; j < j2; j++)
		{
			this.diffTableVals[j][i1] += rect.t;
			this.cmd("SetHighlight", this.diffTableID[j][i1], 1);
			this.cmd("SetForegroundColor", this.diffTableID[j][i1], "#FF6600");
			this.cmd("SetText", this.diffTableID[j][i1], this.diffTableVals[j][i1]);
			
			if (i2 < nx)
			{
				this.diffTableVals[j][i2] -= rect.t;
				this.cmd("SetHighlight", this.diffTableID[j][i2], 1);
				this.cmd("SetForegroundColor", this.diffTableID[j][i2], "#FF6600");
				this.cmd("SetText", this.diffTableID[j][i2], this.diffTableVals[j][i2]);
			}
		}
		this.cmd("Step");
		// Then unhighlight all cells
		for (var j = j1; j < j2; j++)
		{
			this.cmd("SetForegroundColor", this.diffTableID[j][i1], "#000000");
			this.cmd("SetHighlight", this.diffTableID[j][i1], 0);
			
			if (i2 < nx)
			{
				this.cmd("SetForegroundColor", this.diffTableID[j][i2], "#000000");
				this.cmd("SetHighlight", this.diffTableID[j][i2], 0);
			}
		}
	}
	
	// Restore diff array (prefix sum restoration)
	var restoreLabelID = this.nextIndex++;
	this.oldIDs.push(restoreLabelID);
	this.cmd("CreateLabel", restoreLabelID, "Restoring Diff Array (Prefix Sum)",
		CCC14S4.COMPRESSED_TABLE_START_X, CCC14S4.DIFF_TABLE_START_Y + 200, 0);
	this.cmd("SetForegroundColor", restoreLabelID, "#990000");
	this.cmd("Step");
	
	// Restore each row (prefix sum) directly on diff array
	for (var j = 0; j < ny; j++)
	{
		var prefixSum = 0;
		for (var i = 0; i < nx; i++)
		{
			prefixSum += this.diffTableVals[j][i];
			this.diffTableVals[j][i] = prefixSum;
			
			this.cmd("SetHighlight", this.diffTableID[j][i], 1);
			this.cmd("SetForegroundColor", this.diffTableID[j][i], "#FF6600");
			this.cmd("SetText", this.diffTableID[j][i], prefixSum);
		}
		this.cmd("Step");
		// Unhighlight the row
		for (var i = 0; i < nx; i++)
		{
			this.cmd("SetHighlight", this.diffTableID[j][i], 0);
			this.cmd("SetForegroundColor", this.diffTableID[j][i], "#000000");
		}
	}
	
	// Change label to indicate checking cells
	this.cmd("SetText", restoreLabelID, "Checking Restored Values (Threshold T=" + T + ")");
	this.cmd("Step");
	
	// Check each cell in restored diff array
	var totalArea = 0;
	for (var j = 0; j < ny - 1; j++)
	{
		for (var i = 0; i < nx - 1; i++)
		{
			var value = this.diffTableVals[j][i];
			
			// Highlight current cell
			this.cmd("SetHighlight", this.diffTableID[j][i], 1);
			this.cmd("SetForegroundColor", this.diffTableID[j][i], "#FF6600");
			
			if (value >= T)
			{
				// Calculate corresponding region
				var width = uniqueXs[i+1] - uniqueXs[i];
				var height = uniqueYs[j+1] - uniqueYs[j];
				
				// Update info label with formula
				totalArea += width * height;
				this.cmd("SetText", currentRectLabelID, 
					"Cell [" + j + "][" + i + "] = " + value + " >= " + T + "\n" +
					"Region: x=[" + uniqueXs[i] + "," + uniqueXs[i+1] + "), y=[" + uniqueYs[j] + "," + uniqueYs[j+1] + ")\n" +
					"Width = " + uniqueXs[i+1] + " - " + uniqueXs[i] + " = " + width + "\n" +
					"Height = " + uniqueYs[j+1] + " - " + uniqueYs[j] + " = " + height + "\n" +
					"Area = " + width + " * " + height + " = " + (width * height) + "\n" +
					"totalArea = " + totalArea);
				
				// Highlight corresponding cell in compressed table
				this.cmd("SetHighlight", this.compressedTableID[j][i], 1);
				this.cmd("SetForegroundColor", this.compressedTableID[j][i], "#00FF00");
				
				// Highlight corresponding region in brute force table
				for (var y = uniqueYs[j]; y < uniqueYs[j+1]; y++)
				{
					for (var x = uniqueXs[i]; x < uniqueXs[i+1]; x++)
					{
						if (y < bruteHeight && x < bruteWidth)
						{
							this.cmd("SetHighlight", this.bruteTableID[y][x], 1);
							this.cmd("SetForegroundColor", this.bruteTableID[y][x], "#00FF00");
						}
					}
				}
				
				this.cmd("Step");
				
				// Unhighlight
				this.cmd("SetHighlight", this.compressedTableID[j][i], 0);
				this.cmd("SetForegroundColor", this.compressedTableID[j][i], "#000000");
				
				for (var y = uniqueYs[j]; y < uniqueYs[j+1]; y++)
				{
					for (var x = uniqueXs[i]; x < uniqueXs[i+1]; x++)
					{
						if (y < bruteHeight && x < bruteWidth)
						{
							this.cmd("SetHighlight", this.bruteTableID[y][x], 0);
							this.cmd("SetForegroundColor", this.bruteTableID[y][x], "#000000");
						}
					}
				}
			}
			
			// Unhighlight current cell
			this.cmd("SetHighlight", this.diffTableID[j][i], 0);
			this.cmd("SetForegroundColor", this.diffTableID[j][i], "#000000");
		}
	}
	
	return this.commands;
}

CCC14S4.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
}

CCC14S4.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}

var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new CCC14S4(animManag, 1200, 700);
	//currentAlg = new CCC14S4(animManag, canvas.width, canvas.height);
}
