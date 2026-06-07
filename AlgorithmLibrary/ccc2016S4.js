// Copyright 2016 David Galles, University of San Francisco. All rights reserved.

var HIGHLIGHT_CIRCLE_COLOR = "#000000";
var DFS_TREE_COLOR         = "#0000FF";

// ── Sample Input ─────────────────────────────────────────────────────
var SAMPLE_N = 7;
var SAMPLE_LON = [47, 12, 12, 3, 9, 9, 3];

// ── Code Display (without prefix sum) ───────────────────────────────────
var CODE_WITHOUT_PREFIX = [
	["def dfs(l, r):"],                                                          // 0
	["    if l == r:"],                                                           // 1
	["        m = max(m, lon[l])"],                                              // 2
	["        return True"],                                                      // 3
	["    if l + 1 == r:"],                                                       // 4
	["        if lon[l] == lon[r]:"],                                             // 5
	["            m = max(m, lon[l] * 2)"],                                       // 6
	["            return True"],                                                   // 7
	["        else:"],                                                            // 8
	["            m = max(m, lon[l], lon[r])"],                                    // 9
	["            return False"],                                                  // 10
	["    # Case 1: Split into A and B"],                                        // 11
	["    for s in range(l+1, r+1):"],                                            // 12
	["        rA = dfs(l, s-1)"],                                                 // 13
	["        rB = dfs(s, r)"],                                                   // 14
	["        if rA and rB and sum(lon[l:s]) == sum(lon[s:r+1]):"],              // 15
	["            m = max(m, sum(lon[l:r+1]))"],                                 // 16
	["            return True"],                                                  // 17
	["    # Case 2: Split into A, B, C"],                                         // 18
	["    for s1 in range(l+1, r):"],                                             // 19
	["        for s2 in range(s1+1, r+1):"],                                      // 20
	["        rA = dfs(l, s1-1)"],                                            // 21
	["        rB = dfs(s1, s2-1)"],                                           // 22
	["        rC = dfs(s2, r)"],                                               // 23
	["        if rA and rB and rC and sum(lon[l:s1]) == sum(lon[s2:r+1]):"],   // 24
	["            m = max(m, sum(lon[l:r+1]))"],                               // 25
	["            return True"],                                               // 26
	["    return False"]                                                          // 27
];

// ── Code Display (with prefix sum) ─────────────────────────────────────
var CODE_WITH_PREFIX = [
	["def prefix_sum(l, r):"],                                                   // 0 (ignore highlighting)
	["    if l == 0:"],                                                           // 1 (ignore highlighting)
	["        return prefix[r]"],                                                 // 2 (ignore highlighting)
	["    return prefix[r] - prefix[l-1]"],                                      // 3 (ignore highlighting)
	[""],                                                                         // 4 (ignore highlighting)
	["def dfs(l, r):"],                                                          // 5
	["    if l == r:"],                                                           // 6
	["        m = max(m, lon[l])"],                                              // 7
	["        return True"],                                                      // 8
	["    if l + 1 == r:"],                                                       // 9
	["        if lon[l] == lon[r]:"],                                             // 10
	["            m = max(m, lon[l] * 2)"],                                       // 11
	["            return True"],                                                   // 12
	["        else:"],                                                            // 13
	["            m = max(m, lon[l], lon[r])"],                                    // 14
	["            return False"],                                                  // 15
	["    # Case 1: Split into A and B"],                                        // 16
	["    for s in range(l+1, r+1):"],                                            // 17
	["        rA = dfs(l, s-1)"],                                                 // 18
	["        rB = dfs(s, r)"],                                                   // 19
	["        if rA and rB and prefix_sum(l, s) == prefix_sum(s, r):"],            // 20
	["            m = max(m, prefix_sum(l, r))"],                                  // 21
	["            return True"],                                                  // 22
	["    # Case 2: Split into A, B, C"],                                         // 23
	["    for s1 in range(l+1, r):"],                                             // 24
	["        for s2 in range(s1+1, r+1):"],                                      // 25
	["        rA = dfs(l, s1-1)"],                                                // 26
	["        rB = dfs(s1, s2-1)"],                                               // 27
	["        rC = dfs(s2, r)"],                                                  // 28
	["        if rA and rB and rC and prefix_sum(l, s1) == prefix_sum(s2, r):"], // 29
	["            m = max(m, prefix_sum(l, r))"],                                  // 30
	["            return True"],                                                  // 31
	["    return False"]                                                          // 32
];

var CODE_START_X     = 10;
var CODE_START_Y     = 120;
var CODE_LINE_HEIGHT = 14;
var CODE_HIGHLIGHT_COLOR = "#FF0000";
var CODE_STANDARD_COLOR  = "#000000";

// ══════════════════════════════════════════════════════════════════
function CCC2016S4(am)
{
	this.init(am);
}

CCC2016S4.prototype = new Algorithm();
CCC2016S4.prototype.constructor = CCC2016S4;
CCC2016S4.superclass = Algorithm.prototype;

// ── addControls ───────────────────────────────────────────────────

CCC2016S4.prototype.addControls = function()
{
	this.startButton = addControlToAlgorithmBar("Button", "Run  ");
	this.startButton.onclick = this.startCallback.bind(this);
	

	addLabelToAlgorithmBar("....Use prefix sum ");
	this.prefixSumCheckbox = addControlToAlgorithmBar("Checkbox", "");
	this.prefixSumCheckbox.onclick = this.prefixSumCallback.bind(this);
	this.usePrefixSum = false;
}

CCC2016S4.prototype.prefixSumCallback = function(event)
{
	this.usePrefixSum = this.prefixSumCheckbox.checked;
	this.animationManager.resetAll();
	this.setup();
}

// ── init ──────────────────────────────────────────────────────────

CCC2016S4.prototype.init = function(am, w, h)
{
	this.nextIndex = 0;
	CCC2016S4.superclass.init.call(this, am, w, h);
	this.addControls();

	this.lon = SAMPLE_LON.slice();
	this.n = SAMPLE_N;
	
	this.animationManager.resetAll();
	this.setup();
}

// ── setup ─────────────────────────────────────────────────────────

CCC2016S4.prototype.setup = function()
{
	this.commands = new Array();
	
	// ── Create code display ─────────────────────────────────────
	var code = this.usePrefixSum ? CODE_WITH_PREFIX : CODE_WITHOUT_PREFIX;
	this.codeID = new Array(Math.max(CODE_WITHOUT_PREFIX.length, CODE_WITH_PREFIX.length));
	for (var i = 0; i < this.codeID.length; i++)
	{
		this.codeID[i] = this.nextIndex++;
		if (i < code.length) {
			this.cmd("CreateLabel",
				this.codeID[i], code[i][0],
				CODE_START_X,
				CODE_START_Y + i * CODE_LINE_HEIGHT,
				0);
			this.cmd("SetForegroundColor", this.codeID[i], CODE_STANDARD_COLOR);
		} else {
			this.cmd("CreateLabel",
				this.codeID[i], "",
				CODE_START_X,
				CODE_START_Y + i * CODE_LINE_HEIGHT,
				0);
		}
	}
	
	// ── Create index row ─────────────────────────────────────────
	this.indexLabelID = this.nextIndex++;
	this.cmd("CreateLabel", this.indexLabelID, "index:", 10, 0, 0);
	this.cmd("SetForegroundColor", this.indexLabelID, "#888888");
	
	this.indexValueID = new Array(this.lon.length);
	var indexX = 50;
	for (var i = 0; i < this.lon.length; i++) {
		this.indexValueID[i] = this.nextIndex++;
		this.cmd("CreateLabel", this.indexValueID[i], i.toString(), indexX + i * 50, 0, 0);
		this.cmd("SetForegroundColor", this.indexValueID[i], "#888888");
	}
	
	// ── Create array display (data line) ─────────────────────────
	this.arrayLabelID = this.nextIndex++;
	this.cmd("CreateLabel", this.arrayLabelID, "lon:", 10, 15, 0);
	this.cmd("SetForegroundColor", this.arrayLabelID, "#0000FF");
	
	this.lonValueID = new Array(this.lon.length);
	var lonX = 50;
	for (var i = 0; i < this.lon.length; i++) {
		this.lonValueID[i] = this.nextIndex++;
		this.cmd("CreateLabel", this.lonValueID[i], this.lon[i].toString(), lonX + i * 50, 15, 0);
		this.cmd("SetForegroundColor", this.lonValueID[i], "#0000FF");
	}
	
	// ── Create prefix sum array display ─────────────────────────
	this.prefixSum = this.computePrefixSum();
	this.prefixSumLabelID = this.nextIndex++;
	this.cmd("CreateLabel", this.prefixSumLabelID, "prefix:", 10, 30, 0);
	this.cmd("SetForegroundColor", this.prefixSumLabelID, "#AA00AA");
	var prefixAlpha = this.usePrefixSum ? 1 : 0;
	this.cmd("SetAlpha", this.prefixSumLabelID, prefixAlpha);
	
	this.prefixSumValueID = new Array(this.prefixSum.length);
	var prefixX = 50;
	for (var i = 0; i < this.prefixSum.length; i++) {
		this.prefixSumValueID[i] = this.nextIndex++;
		this.cmd("CreateLabel", this.prefixSumValueID[i], this.prefixSum[i].toString(), prefixX + i * 50, 30, 0);
		this.cmd("SetForegroundColor", this.prefixSumValueID[i], "#AA00AA");
		this.cmd("SetAlpha", this.prefixSumValueID[i], prefixAlpha);
	}
	
	// ── Create result display ────────────────────────────────────
	this.resultLabelID = this.nextIndex++;
	this.cmd("CreateLabel", this.resultLabelID, "m = -1", 10, 60, 0);
	this.cmd("SetForegroundColor", this.resultLabelID, "#00AA00");
	
	// ── Create message area ───────────────────────────────────────
	this.messageID = new Array();
	this.messageY = 10;
	
	animationManager.setAllLayers([0, 1]);
	animationManager.StartNewAnimation(this.commands);
	animationManager.skipForward();
	animationManager.clearHistory();
	
	this.highlightCircleL = this.nextIndex++;
}

// ── Helper: highlight code line ───────────────────────────────────

CCC2016S4.prototype.highlightCodeLine = function(lineIdx, on)
{
	// Add offset of 5 when in prefix sum mode to account for prefix_sum function
	var actualLineIdx = this.usePrefixSum ? lineIdx + 5 : lineIdx;
	var color = on ? CODE_HIGHLIGHT_COLOR : CODE_STANDARD_COLOR;
	this.cmd("SetForegroundColor", this.codeID[actualLineIdx], color);
}

// ── Helper: compute prefix sum ────────────────────────────────────

CCC2016S4.prototype.computePrefixSum = function()
{
	var prefix = [this.lon[0]];
	for (var i = 1; i < this.lon.length; i++) {
		prefix.push(prefix[prefix.length - 1] + this.lon[i]);
	}
	return prefix;
}

// ── Helper: highlight prefix sum index ───────────────────────────

CCC2016S4.prototype.highlightPrefixSumIndex = function(idx, on)
{
	if (idx >= 0 && idx < this.prefixSumValueID.length) {
		if (on) {
			// Delete existing square if it exists
			if (this.prefixSquareHighlightID && this.prefixSquareHighlightID[idx] !== undefined) {
				this.cmd("Delete", this.prefixSquareHighlightID[idx]);
			}
			
			// Create square around the entry
			var x = 50 + idx * 50;
			var y = 40;
			var size = 30;
			
			if (!this.prefixSquareHighlightID) {
				this.prefixSquareHighlightID = {};
			}
			this.prefixSquareHighlightID[idx] = this.nextIndex++;
			this.cmd("CreateRectangle", this.prefixSquareHighlightID[idx], "", size, size, x, y);
			this.cmd("SetBackgroundColor", this.prefixSquareHighlightID[idx], "#FF0000");
			this.cmd("SetForegroundColor", this.prefixSquareHighlightID[idx], "transparent");
			this.cmd("SetAlpha", this.prefixSquareHighlightID[idx], 0.3);
			this.cmd("Step");
		} else {
			// Delete square
			if (this.prefixSquareHighlightID && this.prefixSquareHighlightID[idx] !== undefined) {
				this.cmd("Delete", this.prefixSquareHighlightID[idx]);
				delete this.prefixSquareHighlightID[idx];
			}
		}
	}
}

// ── Helper: highlight lon range ───────────────────────────────────

CCC2016S4.prototype.highlightLonRange = function(start, end, on)
{
	if (on) {
		// Create rectangle around the range
		var startX = 50 + start * 50;
		var endX = 50 + end * 50 + 30;
		var y = 15;
		var width = endX - startX;
		var height = 10;
		
		this.lonRangeHighlightID = this.nextIndex++;
		this.cmd("CreateRectangle", this.lonRangeHighlightID, "", width, height, startX, y, "left", "top");
		this.cmd("SetBackgroundColor", this.lonRangeHighlightID, "#00FFFF");
		this.cmd("SetForegroundColor", this.lonRangeHighlightID, "transparent");
		this.cmd("SetAlpha", this.lonRangeHighlightID, 0.3);
		this.cmd("Step");
	} else {
		// Delete rectangle
		if (this.lonRangeHighlightID !== undefined) {
			this.cmd("Delete", this.lonRangeHighlightID);
			this.lonRangeHighlightID = undefined;
		}
	}
}

// ── Helper: highlight index ───────────────────────────────────────

CCC2016S4.prototype.highlightIndex = function(idx, on)
{
	if (idx >= 0 && idx < this.indexValueID.length) {
		var color = on ? "#FF0000" : "#888888";
		this.cmd("SetForegroundColor", this.indexValueID[idx], color);
	}
}

// ── Helper: get sum using prefix sum ─────────────────────────────

CCC2016S4.prototype.getPrefixSum = function(start, end)
{
	// Clear all existing prefix highlights first
	this.clearAllPrefixHighlights();
	
	// Highlight lon range
	this.highlightLonRange(start, end, true);
	// Highlight prefix indices
	this.highlightPrefixSumIndex(end, true);
	if (start > 0) {
		this.highlightPrefixSumIndex(start - 1, true);
	}
	// Highlight index row
	this.highlightIndex(start, true);
	this.highlightIndex(end - 1, true);
	
	// Display formula message
	var formulaMsgID = this.nextIndex++;
	this.messageID.push(formulaMsgID);
	var formula;
	if (start == 0) {
		formula = "prefix_sum(" + start + "," + end + ") = prefix[" + end + "] = " + this.prefixSum[end];
	} else {
		formula = "prefix_sum(" + start + "," + end + ") = prefix[" + end + "] - prefix[" + (start - 1) + "] = " + this.prefixSum[end] + " - " + this.prefixSum[start - 1] + " = " + (this.prefixSum[end] - this.prefixSum[start - 1]);
	}
	this.cmd("CreateLabel", formulaMsgID, formula, 10, 75, 0);
	this.cmd("SetForegroundColor", formulaMsgID, "#FF8800");
	this.cmd("Step");
	
	// Clear highlights
	this.highlightLonRange(start, end, false);
	this.highlightPrefixSumIndex(end, false);
	if (start > 0) {
		this.highlightPrefixSumIndex(start - 1, false);
	}
	this.highlightIndex(start, false);
	this.highlightIndex(end - 1, false);
	
	// Delete formula message
	this.cmd("Delete", formulaMsgID);
	
	if (start == 0) {
		return this.prefixSum[end];
	}
	return this.prefixSum[end] - this.prefixSum[start - 1];
}

// ── Helper: clear all prefix highlights ───────────────────────────

CCC2016S4.prototype.clearAllPrefixHighlights = function()
{
	if (this.prefixSquareHighlightID) {
		for (var idx in this.prefixSquareHighlightID) {
			if (this.prefixSquareHighlightID[idx] !== undefined) {
				this.cmd("Delete", this.prefixSquareHighlightID[idx]);
			}
		}
		this.prefixSquareHighlightID = {};
	}
}

// ── DFS Entry Point ───────────────────────────────────────────────

CCC2016S4.prototype.startCallback = function(event)
{
	this.implementAction(this.doDFS.bind(this), "");
}

CCC2016S4.prototype.doDFS = function()
{
	this.commands = new Array();
	this.messageID = new Array();
	this.messageY = 10;
	
	this.m = -1;
	this.callCount = 0;
	
	// Pre-generate DFS tree
	this.generateTreeGraph();
	this.calculateTreePositions();
	
	// Initialize tree visualization arrays
	this.treeCircleID = new Array(this.treeNodes.length);
	this.treeLabelID = new Array(this.treeNodes.length);
	this.treeResultLabelID = new Array(this.treeNodes.length);
	this.nodeCreated = new Array(this.treeNodes.length).fill(false);
	
	this.cmd("SetText", this.resultLabelID, "m = -1");
	
	// Reset prefix sum highlights
	if (this.prefixSumValueID) {
		for (var i = 0; i < this.prefixSumValueID.length; i++) {
			this.highlightPrefixSumIndex(i, false);
		}
	}
	
	var result = this.dfs(0, this.n - 1, 0, -1);
	
	var finalResultID = this.nextIndex++;
	var msg = "Maximum m = " + this.m;
	this.cmd("CreateLabel", finalResultID, msg, 10, 85, 0);
	this.cmd("SetForegroundColor", finalResultID, "#FF0000");
	this.cmd("Step");
	
	var cacheInfoID = this.nextIndex++;
	var modeText = this.usePrefixSum ? "with prefix sum" : "without prefix sum";
	this.cmd("CreateLabel", cacheInfoID, "Total calls: " + this.callCount + " (" + modeText + ")", 10, 100, 0);
	this.cmd("SetForegroundColor", cacheInfoID, "#888888");
	this.cmd("Step");
	
	return this.commands;
}

// ── DFS Implementation ────────────────────────────────────────────

CCC2016S4.prototype.dfs = function(l, r, indent, parentIdx)
{
	this.callCount++;
	
	var key = l + "," + r;
	var nodeIdx;
	if (this.nodeMap[key] === undefined) {
		nodeIdx = this.nodeCount++;
		this.nodeMap[key] = nodeIdx;
		this.treeNodes.push({ l: l, r: r, result: null });
		if (parentIdx !== -1) {
			this.treeEdges.push({ from: parentIdx, to: nodeIdx });
		}
		this.calculatePositionForNewNode(nodeIdx, parentIdx);
		// Resize arrays to accommodate new node
		this.treeCircleID.push(null);
		this.treeLabelID.push(null);
		this.treeResultLabelID.push(null);
		this.nodeCreated.push(false);
	} else {
		nodeIdx = this.nodeMap[key];
	}
	
	if (!this.nodeCreated[nodeIdx]) {
		this.createNode(nodeIdx);
	}

	if (parentIdx !== -1) {
		this.drawEdge(parentIdx, nodeIdx);
	}
	
	var msgX = 1050 + indent * 30;
	var callMsgID = this.nextIndex++;
	this.messageID.push(callMsgID);
	this.cmd("CreateLabel", callMsgID, "dfs(" + l + "," + r + ")", msgX, this.messageY, 0);
	this.cmd("SetForegroundColor", callMsgID, "#0000FF");
	this.messageY += 15;
	this.cmd("Step");
	
	this.highlightCodeLine(0, true);
	this.cmd("Step");
	this.highlightCodeLine(0, false);
	
	var result;
	
	// Base case: l == r
	this.highlightCodeLine(1, true);
	this.cmd("Step");
	if (l == r) {
		this.highlightCodeLine(2, true);
		this.cmd("Step");
		this.m = Math.max(this.m, this.lon[l]);
		this.cmd("SetText", this.resultLabelID, "m = " + this.m);
		this.cmd("Step");
		this.highlightCodeLine(2, false);
		
		this.highlightCodeLine(3, true);
		this.cmd("Step");
		this.highlightCodeLine(3, false);
		
		result = true;
		this.cmd("SetText", this.treeResultLabelID[nodeIdx], "True");
		this.cmd("SetForegroundColor", this.treeResultLabelID[nodeIdx], "#0000FF");
	}
	this.highlightCodeLine(1, false);
	
	if (result === undefined) {
		// Base case: l + 1 == r
		this.highlightCodeLine(4, true);
		this.cmd("Step");
		if (l + 1 == r) {
			this.highlightCodeLine(5, true);
			this.cmd("Step");
			if (this.lon[l] == this.lon[r]) {
				this.highlightCodeLine(6, true);
				this.cmd("Step");
				this.m = Math.max(this.m, this.lon[l] * 2);
				this.cmd("SetText", this.resultLabelID, "m = " + this.m);
				this.cmd("Step");
				this.highlightCodeLine(6, false);
				
				this.highlightCodeLine(7, true);
				this.cmd("Step");
				this.highlightCodeLine(7, false);
				
				result = true;
				this.cmd("SetText", this.treeResultLabelID[nodeIdx], "True");
				this.cmd("SetForegroundColor", this.treeResultLabelID[nodeIdx], "#0000FF");
			} else {
				this.highlightCodeLine(8, true);
				this.cmd("Step");
				this.highlightCodeLine(9, true);
				this.cmd("Step");
				this.m = Math.max(this.m, this.lon[l], this.lon[r]);
				this.cmd("SetText", this.resultLabelID, "m = " + this.m);
				this.cmd("Step");
				this.highlightCodeLine(9, false);
				
				this.highlightCodeLine(10, true);
				this.cmd("Step");
				this.highlightCodeLine(10, false);
				
				result = false;
				this.cmd("SetText", this.treeResultLabelID[nodeIdx], "False");
				this.cmd("SetForegroundColor", this.treeResultLabelID[nodeIdx], "#FF0000");
			}
			this.highlightCodeLine(5, false);
		}
		this.highlightCodeLine(4, false);
	}
	
	if (result === undefined) {
		// Case 1: Split into A and B
		this.highlightCodeLine(11, true);
		this.cmd("Step");
		this.highlightCodeLine(11, false);
		
		this.highlightCodeLine(12, true);
		this.cmd("Step");
		
		for (var s = l + 1; s <= r; s++) {
			var sumA, sumB;
			if (this.usePrefixSum) {
				sumA = this.getPrefixSum(l, s - 1);
				sumB = this.getPrefixSum(s, r);
			} else {
				sumA = this.sumRange(l, s);
				sumB = this.sumRange(s, r + 1);
			}
			
			this.highlightCodeLine(13, true);
			this.cmd("Step");
			var rA = this.dfs(l, s - 1, indent + 1, nodeIdx);
			this.highlightCodeLine(13, false);
			
			this.highlightCodeLine(14, true);
			this.cmd("Step");
			var rB = this.dfs(s, r, indent + 1, nodeIdx);
			this.highlightCodeLine(14, false);
			
			this.highlightCodeLine(15, true);
			this.cmd("Step");
			
			if (rA && rB && sumA == sumB) {
				this.highlightCodeLine(16, true);
				this.cmd("Step");
				var totalSum;
				if (this.usePrefixSum) {
					totalSum = this.getPrefixSum(l, r);
				} else {
					totalSum = this.sumRange(l, r + 1);
				}
				this.m = Math.max(this.m, totalSum);
				this.cmd("SetText", this.resultLabelID, "m = " + this.m);
				this.cmd("Step");
				this.highlightCodeLine(16, false);
				
				this.highlightCodeLine(17, true);
				this.cmd("Step");
				this.highlightCodeLine(17, false);
				
				result = true;
				this.cmd("SetText", this.treeResultLabelID[nodeIdx], "True");
				this.cmd("SetForegroundColor", this.treeResultLabelID[nodeIdx], "#0000FF");
				break;
			}
			this.highlightCodeLine(15, false);
		}
		this.highlightCodeLine(12, false);
	}
	
	if (result === undefined) {
		// Case 2: Split into A, B, C
		this.highlightCodeLine(18, true);
		this.cmd("Step");
		this.highlightCodeLine(18, false);
		
		this.highlightCodeLine(19, true);
		this.cmd("Step");
		
		for (var s1 = l + 1; s1 < r; s1++) {
			this.highlightCodeLine(20, true);
			this.cmd("Step");
			
			for (var s2 = s1 + 1; s2 <= r; s2++) {
				var sumA, sumC;
				if (this.usePrefixSum) {
					sumA = this.getPrefixSum(l, s1 - 1);
					sumC = this.getPrefixSum(s2, r);
				} else {
					sumA = this.sumRange(l, s1);
					sumC = this.sumRange(s2, r + 1);
				}
				
				this.highlightCodeLine(21, true);
				this.cmd("Step");
				var rA = this.dfs(l, s1 - 1, indent + 1, nodeIdx);
				this.highlightCodeLine(21, false);
				
				this.highlightCodeLine(22, true);
				this.cmd("Step");
				var rB = this.dfs(s1, s2 - 1, indent + 1, nodeIdx);
				this.highlightCodeLine(22, false);
				
				this.highlightCodeLine(23, true);
				this.cmd("Step");
				var rC = this.dfs(s2, r, indent + 1, nodeIdx);
				this.highlightCodeLine(23, false);
				
				this.highlightCodeLine(24, true);
				this.cmd("Step");
				
				if (rA && rB && rC && sumA == sumC) {
					this.highlightCodeLine(25, true);
					this.cmd("Step");
					var totalSum;
					if (this.usePrefixSum) {
						totalSum = this.getPrefixSum(l, r);
					} else {
						totalSum = this.sumRange(l, r + 1);
					}
					this.m = Math.max(this.m, totalSum);
					this.cmd("SetText", this.resultLabelID, "m = " + this.m);
					this.cmd("Step");
					this.highlightCodeLine(25, false);
					
					this.highlightCodeLine(26, true);
					this.cmd("Step");
					this.highlightCodeLine(26, false);
					
					result = true;
					this.cmd("SetText", this.treeResultLabelID[nodeIdx], "True");
					this.cmd("SetForegroundColor", this.treeResultLabelID[nodeIdx], "#0000FF");
					break;
				}
				this.highlightCodeLine(24, false);
				
				if (result === true) break;
			}
			this.highlightCodeLine(20, false);
			
			if (result === true) break;
		}
		this.highlightCodeLine(19, false);
	}
	
	if (result === undefined) {
		this.highlightCodeLine(27, true);
		this.cmd("Step");
		this.highlightCodeLine(27, false);
		result = false;
		this.cmd("SetText", this.treeResultLabelID[nodeIdx], "False");
		this.cmd("SetForegroundColor", this.treeResultLabelID[nodeIdx], "#FF0000");
	}
	
	this.treeNodes[nodeIdx].result = result;
	
	this.cmd("Delete", callMsgID);
	this.messageY -= 15;
	
	return result;
}

// ── Helper: sum range (inclusive start, exclusive end) ─────────────

CCC2016S4.prototype.sumRange = function(start, end)
{
	var sum = 0;
	for (var i = start; i < end; i++) {
		sum += this.lon[i];
	}
	return sum;
}

// ── Tree Visualization ───────────────────────────────────────────────

CCC2016S4.prototype.generateTreeGraph = function()
{
	this.treeNodes = [];
	this.treeEdges = [];
	this.nodeMap = {};
	this.nodeCount = 0;
	
	this.generateTreeGraphDFS(0, this.n - 1, -1);
}

// ── 修改一：去掉 sum 条件，所有子调用都生成节点 ──────────────────

CCC2016S4.prototype.generateTreeGraphDFS = function(l, r, parentIdx)
{
	var key = l + "," + r;
	
	if (this.nodeMap[key] !== undefined) {
		return this.nodeMap[key];
	}
	
	var nodeIdx = this.nodeCount++;
	this.nodeMap[key] = nodeIdx;
	this.treeNodes.push({ l: l, r: r, result: null });
	
	if (parentIdx !== -1) {
		this.treeEdges.push({ from: parentIdx, to: nodeIdx });
	}
	
	// Base cases: no children
	if (l == r) return nodeIdx;
	if (l + 1 == r) return nodeIdx;
	
	// Case 1: Split into A and B
	// ── 去掉 sumA == sumB 的条件，所有 s 都生成子节点 ──
	for (var s = l + 1; s <= r; s++) {
		this.generateTreeGraphDFS(l, s - 1, nodeIdx);
		this.generateTreeGraphDFS(s, r, nodeIdx);
	}
	
	// Case 2: Split into A, B, C
	// ── 同上，去掉 sumA == sumC 的条件 ──
	for (var s1 = l + 1; s1 < r; s1++) {
		for (var s2 = s1 + 1; s2 <= r; s2++) {
			this.generateTreeGraphDFS(l, s1 - 1, nodeIdx);
			this.generateTreeGraphDFS(s1, s2 - 1, nodeIdx);
			this.generateTreeGraphDFS(s2, r, nodeIdx);
		}
	}
	
	return nodeIdx;
}

// ── 修改二：calculateTreePositions 扩大可用宽度 ──────────────────

CCC2016S4.prototype.calculateTreePositions = function()
{
	this.treePositions = new Array(this.treeNodes.length);
	
	// Build children list
	var children = new Array(this.treeNodes.length);
	for (var i = 0; i < this.treeNodes.length; i++) {
		children[i] = [];
	}
	for (var i = 0; i < this.treeEdges.length; i++) {
		var edge = this.treeEdges[i];
		children[edge.from].push(edge.to);
	}
	
	// Calculate depth and breadth using BFS
	var depth = new Array(this.treeNodes.length).fill(-1);
	var breadth = new Array(this.treeNodes.length).fill(0);
	var nodesAtDepth = [];
	var countAtDepth = [];
	var queue = [{ idx: 0, depth: 0 }];
	depth[0] = 0;
	
	while (queue.length > 0) {
		var cur = queue.shift();
		var idx = cur.idx;
		var d = cur.depth;
		
		if (countAtDepth[d] === undefined) countAtDepth[d] = 0;
		if (!nodesAtDepth[d]) nodesAtDepth[d] = [];
		
		breadth[idx] = countAtDepth[d]++;
		nodesAtDepth[d].push(idx);
		
		for (var i = 0; i < children[idx].length; i++) {
			var childIdx = children[idx][i];
			if (depth[childIdx] === -1) {
				depth[childIdx] = d + 1;
				queue.push({ idx: childIdx, depth: d + 1 });
			}
		}
	}
	
	// Calculate positions
	var startX = 600;
	var startY = 25;
	var levelHeight = 100;
	
	var maxNodes = 0;
	for (var d = 0; d < nodesAtDepth.length; d++) {
		if (nodesAtDepth[d]) maxNodes = Math.max(maxNodes, nodesAtDepth[d].length);
	}
	// ── 扩大可用宽度从 400 到 900，防止节点重叠 ──
	var nodeSpacing = Math.min(80, 900 / (maxNodes + 1));
	
	for (var i = 0; i < this.treeNodes.length; i++) {
		var d = depth[i];
		var b = breadth[i];
		var n = nodesAtDepth[d].length;
		var totalWidth = (n - 1) * nodeSpacing;
		var x = startX - totalWidth / 2 + b * nodeSpacing;
		var y = startY + d * levelHeight;
		// Add random y-offset for nodes at same depth to prevent edge overlap
		var randomOffset = (Math.random() - 0.5) * 60; // Random offset between -10 and 10
		y += randomOffset;
		this.treePositions[i] = { x: x, y: y };
	}
}

CCC2016S4.prototype.createNode = function(nodeIdx)
{
	if (this.nodeCreated[nodeIdx]) return;
	this.nodeCreated[nodeIdx] = true;
	
	var pos = this.treePositions[nodeIdx];
	var node = this.treeNodes[nodeIdx];
	var label = "(" + node.l + "," + node.r + ")";
	
	this.treeCircleID[nodeIdx] = this.nextIndex++;
	this.cmd("CreateCircle", this.treeCircleID[nodeIdx], "", pos.x, pos.y);
	this.cmd("SetRadius", this.treeCircleID[nodeIdx], 20);
	this.cmd("SetForegroundColor", this.treeCircleID[nodeIdx], "#0000FF");
	
	this.treeLabelID[nodeIdx] = this.nextIndex++;
	this.cmd("CreateLabel", this.treeLabelID[nodeIdx], label, pos.x, pos.y);
	this.cmd("SetTextColor", this.treeLabelID[nodeIdx], "#000000");
	
	this.treeResultLabelID[nodeIdx] = this.nextIndex++;
	this.cmd("CreateLabel", this.treeResultLabelID[nodeIdx], "", pos.x, pos.y + 30);
}

CCC2016S4.prototype.calculatePositionForNewNode = function(nodeIdx, parentIdx)
{
	if (parentIdx === -1) {
		this.treePositions[nodeIdx] = { x: 600, y: 25 };
	} else {
		var parentPos = this.treePositions[parentIdx];
		this.treePositions[nodeIdx] = { x: parentPos.x + 80, y: parentPos.y + 40 };
	}
}

CCC2016S4.prototype.drawEdge = function(fromIdx, toIdx)
{
	this.cmd("Connect",
		this.treeCircleID[fromIdx],
		this.treeCircleID[toIdx],
		"#888888", 0, 1, "");
}

// ── Reset / UI ────────────────────────────────────────────────────

CCC2016S4.prototype.reset = function() {}

CCC2016S4.prototype.enableUI = function(event)
{
	if (this.startButton) this.startButton.disabled = false;
	if (this.prefixSumCheckbox) this.prefixSumCheckbox.disabled = false;
}

CCC2016S4.prototype.disableUI = function(event)
{
	if (this.startButton) this.startButton.disabled = true;
	if (this.prefixSumCheckbox) this.prefixSumCheckbox.disabled = true;
}

var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new CCC2016S4(animManag, canvas.width, canvas.height);
}