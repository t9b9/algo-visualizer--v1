// Copyright 2011 David Galles, University of San Francisco. All rights reserved.

var HIGHLIGHT_CIRCLE_COLOR = "#000000";
var SEGMENT_TREE_COLOR = "#0000FF";
var QUERY_COLOR = "#FF0000";
var UPDATE_COLOR = "#00AA00";

// Python code for segment tree
var PYTHON_CODE = [
	["def build(node, start, end):"],
	["    if start == end:"],
	["        tree[node] = data[start-1]"],
	["    else:"],
	["        mid = (start + end) // 2"],
	["        build(node*2, start, mid)"],
	["        build(node*2+1, mid+1, end)"],
	["        tree[node] = tree[node*2] + tree[node*2+1]"],
	[""],
	["def update(node, start, end, idx, val):"],
	["    if start == end:"],
	["        tree[node] = val"],
	["    else:"],
	["        mid = (start + end) // 2"],
	["        if idx <= mid:"],
	["            update(node*2, start, mid, idx, val)"],
	["        else:"],
	["            update(node*2+1, mid+1, end, idx, val)"],
	["        tree[node] = tree[node*2] + tree[node*2+1]"],
	[""],
	["def query(node, start, end, l, r):"],
	["    if r < start or end < l:"],
	["        return 0"],
	["    if l <= start and end <= r:"],
	["        return tree[node]"],
	["    mid = (start + end) // 2"],
	["    left_sum = query(node*2, start, mid, l, r)"],
	["    right_sum = query(node*2+1, mid+1, end, l, r)"],
	["    return left_sum + right_sum"]
];

var CODE_START_X = 10;
var CODE_START_Y = 10;
var CODE_LINE_HEIGHT = 14;
var CODE_HIGHLIGHT_COLOR = "#FF0000";
var CODE_STANDARD_COLOR = "#000000";

// Tree visualization constants
var TREE_START_X = 750;
var TREE_START_Y = 150;
var LEVEL_HEIGHT = 80;
var NODE_RADIUS = 25;

// Message area constants
var MSG_BASE_X = 1250;
var MSG_START_Y = 130;
var MSG_LINE_HEIGHT = 13;
var MSG_INDENT_W = 20;

function CCCSegmentTreeTest(am)
{
	this.init(am);
}

CCCSegmentTreeTest.prototype = new Algorithm();
CCCSegmentTreeTest.prototype.constructor = CCCSegmentTreeTest;
CCCSegmentTreeTest.superclass = Algorithm.prototype;

CCCSegmentTreeTest.prototype.addControls = function()
{
	this.buildButton = addControlToAlgorithmBar("Button", "Build Tree");
	this.buildButton.onclick = this.buildCallback.bind(this);
	
	// Update controls
	addLabelToAlgorithmBar("index:");
	this.updateIndexInput = addControlToAlgorithmBar("Text", "");
	addLabelToAlgorithmBar("value:");
	this.updateValueInput = addControlToAlgorithmBar("Text", "");
	this.updateButton = addControlToAlgorithmBar("Button", "Update");
	this.updateButton.onclick = this.updateCallback.bind(this);
	
	// Query controls
	addLabelToAlgorithmBar("start:");
	this.queryStartInput = addControlToAlgorithmBar("Text", "");
	addLabelToAlgorithmBar("end:");
	this.queryEndInput = addControlToAlgorithmBar("Text", "");
	this.queryButton = addControlToAlgorithmBar("Button", "Query");
	this.queryButton.onclick = this.queryCallback.bind(this);
	
	// Disable update and query buttons initially
	this.updateButton.disabled = true;
	this.queryButton.disabled = true;
}

CCCSegmentTreeTest.prototype.init = function(am, w, h)
{
	this.nextIndex = 0;
	CCCSegmentTreeTest.superclass.init.call(this, am, w, h);
	this.addControls();
	
	// Hardcoded test data
	this.n = 10;
	this.data = [4, 8, 4, 5, 6, 3, 2, 2, 8, 1];
	
	this.tree = [];
	this.circleID = [];
	this.labelID = [];
	this.rangeLabelID = [];
	this.nodeCreated = [];
	this.treeBuilt = false;
	
	this.animationManager.resetAll();
	this.setup();
}

CCCSegmentTreeTest.prototype.setup = function()
{
	this.commands = new Array();
	
	// Create code labels
	this.codeID = new Array(PYTHON_CODE.length);
	for (var i = 0; i < PYTHON_CODE.length; i++)
	{
		this.codeID[i] = new Array(PYTHON_CODE[i].length);
		for (var j = 0; j < PYTHON_CODE[i].length; j++)
		{
			this.codeID[i][j] = this.nextIndex++;
			this.cmd("CreateLabel",
				this.codeID[i][j], PYTHON_CODE[i][j],
				CODE_START_X,
				CODE_START_Y + i * CODE_LINE_HEIGHT,
				0);
			this.cmd("SetForegroundColor", this.codeID[i][j], CODE_STANDARD_COLOR);
			if (j > 0)
				this.cmd("AlignRight", this.codeID[i][j], this.codeID[i][j - 1]);
		}
	}
	
	// Create array display at top
	this.arrayLabelID = this.nextIndex++;
	this.cmd("CreateLabel", this.arrayLabelID, "Array:", 270, 40, 0);
	
	this.arrayElementID = [];
	var cellWidth = 40;
	var cellHeight = 35;
	var startX = 340;
	var startY = 35;

	for (var i = 0; i < this.n; i++)
	{
		// 1. 创建矩形方框，并直接把数据 data[i] 作为文字填入
		this.arrayElementID[i] = this.nextIndex++;
		this.cmd("CreateRectangle", 
			this.arrayElementID[i],           // ID
			this.data[i],                      // 直接把数字作为Label放入框内
			cellWidth,                         // 宽度
			cellHeight,                        // 高度
			startX + i * cellWidth,            // X坐标 (紧密相连的阵列)
			startY                             // Y坐标
		);
		this.cmd("SetForegroundColor", this.arrayElementID[i], "#000000");
		this.cmd("SetBackgroundColor", this.arrayElementID[i], "#FFFFFF");
		
		// 2. 存储值标签的引用（为了兼容你后面 doUpdate 里的调用：idx - 1 + this.n）
		// 因为现在数字已经内置在框里了，我们让这个 ID 指向同一个框，确保你后面的 doUpdate 不会报错
		this.arrayElementID[i + this.n] = this.arrayElementID[i];
		
		// 3. 创建索引标签 (0, 1, 2...)，手动定位在方框的上方
		var indexLabelID = this.nextIndex++;
		this.arrayElementID[i + this.n * 2] = indexLabelID;
		this.cmd("CreateLabel", indexLabelID, i, startX + i * cellWidth, 10);
		this.cmd("SetTextColor", indexLabelID, "#666666");
	}
	
	// Create tree array display below array
	this.treeArrayLabelID = this.nextIndex++;
	this.cmd("CreateLabel", this.treeArrayLabelID, "Tree Array:", 270, 75, 0);
	
	this.treeArrayElementID = [];
	var treeCellWidth = 40;
	var treeCellHeight = 35;
	var treeStartX = 340;
	var treeStartY = 70;

	for (var i = 0; i < 4 * this.n; i++)
	{
		// 创建矩形方框，并直接把 tree[i] 作为文字填入
		this.treeArrayElementID[i] = this.nextIndex++;
		this.cmd("CreateRectangle", 
			this.treeArrayElementID[i],      // ID
			"",                                // 初始为空，构建时填充
			treeCellWidth,                     // 宽度
			treeCellHeight,                    // 高度
			treeStartX + i * treeCellWidth,    // X坐标
			treeStartY                         // Y坐标
		);
		this.cmd("SetForegroundColor", this.treeArrayElementID[i], "#000000");
		this.cmd("SetBackgroundColor", this.treeArrayElementID[i], "#FFFFFF");
		
		// 创建索引标签 (0, 1, 2...)，手动定位在方框的上方
		var treeIndexLabelID = this.nextIndex++;
		this.treeArrayElementID[i + 4 * this.n] = treeIndexLabelID;
		this.cmd("CreateLabel", treeIndexLabelID, i, treeStartX + i * treeCellWidth, 10);
		this.cmd("SetTextColor", treeIndexLabelID, "#666666");
	}
	
	animationManager.setAllLayers([0, 1]);
	animationManager.StartNewAnimation(this.commands);
	animationManager.skipForward();
	animationManager.clearHistory();
	
	this.highlightCircleL = this.nextIndex++;
}

CCCSegmentTreeTest.prototype.highlightCodeLine = function(lineIdx, on)
{
	if (this.codeID[lineIdx] === undefined) return;
	var color = on ? CODE_HIGHLIGHT_COLOR : CODE_STANDARD_COLOR;
	for (var j = 0; j < this.codeID[lineIdx].length; j++)
		this.cmd("SetForegroundColor", this.codeID[lineIdx][j], color);
}

CCCSegmentTreeTest.prototype.buildCallback = function(event)
{
	this.implementAction(this.doBuild.bind(this), "");
}

CCCSegmentTreeTest.prototype.updateCallback = function(event)
{
	var idx = parseInt(this.updateIndexInput.value);
	var val = parseInt(this.updateValueInput.value);
	if (isNaN(idx) || isNaN(val) || idx < 0 || idx >= this.n)
	{
		alert("Invalid input. Index must be between 0 and " + (this.n - 1));
		return;
	}
	this.implementAction(this.doUpdate.bind(this, idx, val));
}

CCCSegmentTreeTest.prototype.queryCallback = function(event)
{
	var start = parseInt(this.queryStartInput.value);
	var end = parseInt(this.queryEndInput.value);
	if (isNaN(start) || isNaN(end) || start < 0 || end >= this.n || start > end)
	{
		alert("Invalid input. Start and end must be between 0 and " + (this.n - 1) + ", with start <= end");
		return;
	}
	this.implementAction(this.doQuery.bind(this, start, end));
}

CCCSegmentTreeTest.prototype.doBuild = function()
{
	this.commands = new Array();
	this.messageY = MSG_START_Y;
	this.messageID = [];
	
	if (this.treeBuilt)
	{
		// Clear existing tree
		for (var i = 0; i < this.circleID.length; i++)
		{
			if (this.circleID[i] !== undefined)
			{
				this.cmd("Delete", this.circleID[i]);
				this.cmd("Delete", this.labelID[i]);
				if (this.rangeLabelID[i] !== undefined)
					this.cmd("Delete", this.rangeLabelID[i]);
			}
		}
		this.circleID = [];
		this.labelID = [];
		this.rangeLabelID = [];
		this.nodeCreated = [];
		
		// Clear tree array display
		for (var i = 0; i < this.treeArrayElementID.length; i++)
		{
			if (this.treeArrayElementID[i] !== undefined)
			{
				this.cmd("Delete", this.treeArrayElementID[i]);
			}
		}
		this.treeArrayElementID = [];
		
		// Recreate tree array display
		var treeCellWidth = 40;
		var treeCellHeight = 35;
		var treeStartX = 340;
		var treeStartY = 70;
		
		for (var i = 0; i < 4 * this.n; i++)
		{
			// 创建矩形方框，并直接把 tree[i] 作为文字填入
			this.treeArrayElementID[i] = this.nextIndex++;
			this.cmd("CreateRectangle", 
				this.treeArrayElementID[i],      // ID
				"",                                // 初始为空，构建时填充
				treeCellWidth,                     // 宽度
				treeCellHeight,                    // 高度
				treeStartX + i * treeCellWidth,    // X坐标
				treeStartY                         // Y坐标
			);
			this.cmd("SetForegroundColor", this.treeArrayElementID[i], "#000000");
			this.cmd("SetBackgroundColor", this.treeArrayElementID[i], "#FFFFFF");
			
			// 创建索引标签 (0, 1, 2...)，手动定位在方框的上方
			var treeIndexLabelID = this.nextIndex++;
			this.treeArrayElementID[i + 4 * this.n] = treeIndexLabelID;
			this.cmd("CreateLabel", treeIndexLabelID, i, treeStartX + i * treeCellWidth, 10);
			this.cmd("SetTextColor", treeIndexLabelID, "#666666");
		}
	}
	
	this.tree = new Array(4 * this.n + 5).fill(0);
	this.circleID = new Array(4 * this.n + 5);
	this.labelID = new Array(4 * this.n + 5);
	this.rangeLabelID = new Array(4 * this.n + 5);
	this.nodeCreated = new Array(4 * this.n + 5).fill(false);
	this.nodeRange = new Array(4 * this.n + 5); // Store actual ranges for each node
	
	this.addMessage("Building segment tree...");
	this.highlightCodeLine(0, true);  // def build
	this.cmd("Step");
	this.highlightCodeLine(0, false);
	
	this.build(1, 1, this.n);
	
	this.treeBuilt = true;
	this.addMessage("Segment tree built successfully!");
	this.cmd("Step");
	
	// Enable update and query buttons after build
	this.updateButton.disabled = false;
	this.queryButton.disabled = false;
	
	return this.commands;
}

CCCSegmentTreeTest.prototype.build = function(node, start, end, indent)
{
	indent = indent || 0;
	var msgX = MSG_BASE_X + indent * MSG_INDENT_W;
	
	// Print current function call
	var callMsgID = this.nextIndex++;
	this.messageID.push(callMsgID);
	this.cmd("CreateLabel", callMsgID, "build(" + node + "," + start + "," + end + ")", msgX, this.messageY, 0);
	this.messageY += MSG_LINE_HEIGHT;
	this.cmd("Step");
	
	this.highlightCodeLine(0, true);  // def build
	this.cmd("Step");
	this.highlightCodeLine(0, false);
	
	if (start === end)
	{
		this.highlightCodeLine(1, true);  // if start == end
		this.cmd("Step");
		this.highlightCodeLine(1, false);
		
		this.highlightCodeLine(2, true);  // tree[node] = data[start-1]
		this.tree[node] = this.data[start - 1];
		// Store the actual range (0-based for display)
		this.nodeRange[node] = { start: start - 1, end: end - 1 };
		// Add message with indent alignment
		var leafMsgID = this.nextIndex++;
		this.messageID.push(leafMsgID);
		this.cmd("CreateLabel", leafMsgID, "Leaf node " + node + ": index " + start + ", value = " + this.tree[node], msgX, this.messageY, 0);
		this.messageY += MSG_LINE_HEIGHT;
		this.createNode(node, start, end);
		// Update tree array display
		this.cmd("SetText", this.treeArrayElementID[node], this.tree[node]);
		this.cmd("Step");
		this.highlightCodeLine(2, false);
	}
	else
	{
		this.highlightCodeLine(4, true);  // mid = (start + end) // 2
		var mid = Math.floor((start + end) / 2);
		this.cmd("Step");
		this.highlightCodeLine(4, false);
		
		this.highlightCodeLine(5, true);  // build left
		this.build(node * 2, start, mid, indent + 1);
		this.highlightCodeLine(5, false);
		
		this.highlightCodeLine(6, true);  // build right
		this.build(node * 2 + 1, mid + 1, end, indent + 1);
		this.highlightCodeLine(6, false);
		
		this.highlightCodeLine(7, true);  // tree[node] = sum
		this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1];
		// Store the actual range (0-based for display)
		this.nodeRange[node] = { start: start - 1, end: end - 1 };
		// Add message with indent alignment
		var internalMsgID = this.nextIndex++;
		this.messageID.push(internalMsgID);
		this.cmd("CreateLabel", internalMsgID, "Internal node " + node + ": range [" + start + "," + end + "], sum = " + this.tree[node], msgX, this.messageY, 0);
		this.messageY += MSG_LINE_HEIGHT;
		this.createNode(node, start, end);
		this.updateNodeLabel(node);
		// Update tree array display
		this.cmd("SetText", this.treeArrayElementID[node], this.tree[node]);
		this.cmd("Step");
		this.highlightCodeLine(7, false);
	}
}

CCCSegmentTreeTest.prototype.createNode = function(node, start, end)
{
	if (this.nodeCreated[node]) return;
	this.nodeCreated[node] = true;
	
	var level = Math.floor(Math.log2(node));
	var nodesInLevel = Math.pow(2, level);
	var positionInLevel = node - nodesInLevel;
	
	var totalWidth = Math.min(800, 1000 / nodesInLevel);
	var x = TREE_START_X - (nodesInLevel - 1) * totalWidth / 2 + positionInLevel * totalWidth;
	var y = TREE_START_Y + level * LEVEL_HEIGHT;
	
	this.circleID[node] = this.nextIndex++;
	this.cmd("CreateCircle", this.circleID[node], "", x, y);
	this.cmd("SetRadius", this.circleID[node], NODE_RADIUS);
	this.cmd("SetForegroundColor", this.circleID[node], "#000000");
	this.cmd("SetBackgroundColor", this.circleID[node], "#FFFFFF");
	
	this.labelID[node] = this.nextIndex++;
	this.cmd("CreateLabel", this.labelID[node], node, x, y - 8);
	this.cmd("SetTextColor", this.labelID[node], "#0000FF");
	
	this.rangeLabelID[node] = this.nextIndex++;
	// Use stored range if available, otherwise convert to 0-based
	var range = this.nodeRange[node] || { start: start - 1, end: end - 1 };
	var rangeText = "[" + range.start + ":" + range.end + "]\n" + this.tree[node];
	this.cmd("CreateLabel", this.rangeLabelID[node], rangeText, x, y + 8);
	this.cmd("SetTextColor", this.rangeLabelID[node], "#000000");
	
	// Create edges to children if they exist
	var leftChild = node * 2;
	var rightChild = node * 2 + 1;
	if (this.circleID[leftChild] !== undefined)
	{
		this.cmd("Connect", this.circleID[node], this.circleID[leftChild], "#000000", 0, 1, "");
	}
	if (this.circleID[rightChild] !== undefined)
	{
		this.cmd("Connect", this.circleID[node], this.circleID[rightChild], "#000000", 0, 1, "");
	}
}

CCCSegmentTreeTest.prototype.updateNodeLabel = function(node)
{
	var range = this.getNodeRange(node);
	var rangeText = "[" + range.start + ":" + range.end + "]\n" + this.tree[node];
	this.cmd("SetText", this.rangeLabelID[node], rangeText);
}

CCCSegmentTreeTest.prototype.getNodeRange = function(node)
{
	// Return the stored range if available, otherwise calculate
	if (this.nodeRange[node] !== undefined)
	{
		return this.nodeRange[node];
	}
	
	// Fallback calculation (shouldn't be used if tree is built properly)
	var level = Math.floor(Math.log2(node));
	var nodesInLevel = Math.pow(2, level);
	var positionInLevel = node - nodesInLevel;
	
	var totalElements = this.n;
	var elementsPerNode = totalElements / nodesInLevel;
	var start = Math.floor(positionInLevel * elementsPerNode);
	var end = Math.floor((positionInLevel + 1) * elementsPerNode) - 1;
	
	if (end >= this.n) end = this.n - 1;
	
	return { start: start, end: end };
}

CCCSegmentTreeTest.prototype.getNodePosition = function(node)
{
	var level = Math.floor(Math.log2(node));
	var nodesInLevel = Math.pow(2, level);
	var positionInLevel = node - nodesInLevel;
	
	var totalWidth = Math.min(800, 1000 / nodesInLevel);
	var x = TREE_START_X - (nodesInLevel - 1) * totalWidth / 2 + positionInLevel * totalWidth;
	var y = TREE_START_Y + level * LEVEL_HEIGHT;
	
	return { x: x, y: y };
}

CCCSegmentTreeTest.prototype.addMessage = function(text)
{
	var msgID = this.nextIndex++;
	this.messageID.push(msgID);
	this.cmd("CreateLabel", msgID, text, MSG_BASE_X, this.messageY, 0);
	this.messageY += MSG_LINE_HEIGHT;
}

CCCSegmentTreeTest.prototype.doUpdate = function(idx, val)
{
	this.commands = new Array();
	this.messageY = MSG_START_Y;
	
	// Clear previous tracking messages
	if (this.messageID) {
		for (var i = 0; i < this.messageID.length; i++)
		{
			this.cmd("Delete", this.messageID[i]);
		}
	}
	this.messageID = [];
	
	// Check if tree is built
	if (!this.treeBuilt || !this.tree || this.tree.length === 0) {
		this.addMessage("Error: Tree not built yet. Please click 'Build Tree' first.");
		this.cmd("Step");
		return this.commands;
	}
	
	this.addMessage("Update: Set position " + idx + " to " + val);
	this.highlightCodeLine(9, true);  // def update
	this.cmd("Step");
	this.highlightCodeLine(9, false);
	
	this.highlightCodeLine(9, true);  // def update (call)
	this.cmd("Step");
	this.highlightCodeLine(9, false);
	
	this._update(1, 1, this.n, idx + 1, val);
	
	// Update array display
	if (this.arrayElementID[idx + this.n]) {
		this.cmd("SetText", this.arrayElementID[idx + this.n], val);
	}
	this.data[idx] = val;
	
	return this.commands;
}

CCCSegmentTreeTest.prototype._update = function(node, start, end, idx, val, indent)
{
	indent = indent || 0;
	var msgX = MSG_BASE_X + indent * MSG_INDENT_W;
	
	// Check if node exceeds array range, dynamically expand if needed
	if (node >= this.tree.length) {
		var oldLen = this.tree.length;
		this.tree.length = Math.max(this.tree.length, node + 100);
		for (var i = oldLen; i < this.tree.length; i++) {
			this.tree[i] = 0;
		}
	}
	
	// Print current function call
	var callMsgID = this.nextIndex++;
	this.messageID.push(callMsgID);
	this.cmd("CreateLabel", callMsgID, "update(" + node + "," + start + "," + end + "," + idx + "," + val + ")", msgX, this.messageY, 0);
	this.messageY += MSG_LINE_HEIGHT;
	this.cmd("Step");
	
	this.highlightCodeLine(9, true);  // def update
	this.cmd("Step");
	this.highlightCodeLine(9, false);
	
	// Check if circle exists before highlighting
	if (this.circleID[node]) {
		this.highlightNode(node, UPDATE_COLOR);
	}
	
	if (start === end)
	{
		this.highlightCodeLine(10, true);  // if start == end
		this.cmd("Step");
		this.highlightCodeLine(10, false);
		
		this.highlightCodeLine(11, true);  // tree[node] = val
		this.tree[node] = val;
		if (this.rangeLabelID[node]) {
			this.updateNodeLabel(node);
		}
		// Add message with indent alignment
		var leafUpdateMsgID = this.nextIndex++;
		this.messageID.push(leafUpdateMsgID);
		this.cmd("CreateLabel", leafUpdateMsgID, "Updated leaf node " + node + " to " + val, msgX, this.messageY, 0);
		this.messageY += MSG_LINE_HEIGHT;
		// Update tree array display
		if (this.treeArrayElementID[node]) {
			this.cmd("SetText", this.treeArrayElementID[node], val);
		}
		this.cmd("Step");
		this.highlightCodeLine(11, false);
	}
	else
	{
		this.highlightCodeLine(13, true);  // mid = (start + end) // 2
		var mid = Math.floor((start + end) / 2);
		this.cmd("Step");
		this.highlightCodeLine(13, false);
		
		this.highlightCodeLine(14, true);  // if idx <= mid
		if (idx <= mid)
		{
			this.cmd("Step");
			this.highlightCodeLine(14, false);
			this.highlightCodeLine(15, true);  // update left
			this._update(node * 2, start, mid, idx, val, indent + 1);
			this.highlightCodeLine(15, false);
		}
		else
		{
			this.cmd("Step");
			this.highlightCodeLine(14, false);
			this.highlightCodeLine(17, true);  // update right
			this._update(node * 2 + 1, mid + 1, end, idx, val, indent + 1);
			this.highlightCodeLine(17, false);
		}
		
		this.highlightCodeLine(18, true);  // tree[node] = sum
		// Ensure child nodes have values, treat undefined as 0
		var leftVal = (this.tree[node * 2] !== undefined) ? this.tree[node * 2] : 0;
		var rightVal = (this.tree[node * 2 + 1] !== undefined) ? this.tree[node * 2 + 1] : 0;
		this.tree[node] = leftVal + rightVal;
		if (this.rangeLabelID[node]) {
			this.updateNodeLabel(node);
		}
		// Add message with indent alignment
		var internalUpdateMsgID = this.nextIndex++;
		this.messageID.push(internalUpdateMsgID);
		this.cmd("CreateLabel", internalUpdateMsgID, "Updated node " + node + " to " + this.tree[node], msgX, this.messageY, 0);
		this.messageY += MSG_LINE_HEIGHT;
		// Update tree array display
		if (this.treeArrayElementID[node]) {
			this.cmd("SetText", this.treeArrayElementID[node], this.tree[node]);
		}
		this.cmd("Step");
		this.highlightCodeLine(18, false);
	}
	
	// Check if circle exists before unhighlighting
	if (this.circleID[node]) {
		this.unhighlightNode(node);
	}
}

CCCSegmentTreeTest.prototype.doQuery = function(l, r)
{
	this.commands = new Array();
	this.messageY = MSG_START_Y;
	
	// Clear previous tracking messages
	if (this.messageID) {
		for (var i = 0; i < this.messageID.length; i++)
		{
			this.cmd("Delete", this.messageID[i]);
		}
	}
	this.messageID = [];
	
	// Check if tree is built
	if (!this.treeBuilt || !this.tree || this.tree.length === 0) {
		this.addMessage("Error: Tree not built yet. Please click 'Build Tree' first.");
		this.cmd("Step");
		return this.commands;
	}
	
	this.addMessage("Query: Sum from " + l + " to " + r);
	this.highlightCodeLine(20, true);  // def query
	this.cmd("Step");
	this.highlightCodeLine(20, false);
	
	this.highlightCodeLine(20, true);  // call query
	this.cmd("Step");
	this.highlightCodeLine(20, false);
	
	var result = this._query(1, 1, this.n, l + 1, r + 1);
	
	this.addMessage("Query result: " + result);
	var resultID = this.nextIndex++;
	this.messageID.push(resultID);
	this.cmd("CreateLabel", resultID, "Result: " + result, MSG_BASE_X, this.messageY, 0);
	this.cmd("SetForegroundColor", resultID, QUERY_COLOR);
	this.messageY += MSG_LINE_HEIGHT;
	this.cmd("Step");
	
	return this.commands;
}

CCCSegmentTreeTest.prototype._query = function(node, start, end, l, r, indent)
{
	indent = indent || 0;
	var msgX = MSG_BASE_X + indent * MSG_INDENT_W;
	
	// Check if node exceeds range, return 0
	if (node >= this.tree.length || node < 0) {
		return 0;
	}
	
	// Print current function call
	var callMsgID = this.nextIndex++;
	this.messageID.push(callMsgID);
	this.cmd("CreateLabel", callMsgID, "query(" + node + "," + start + "," + end + "," + l + "," + r + ")", msgX, this.messageY, 0);
	this.messageY += MSG_LINE_HEIGHT;
	this.cmd("Step");
	
	this.highlightCodeLine(20, true);  // def query
	this.cmd("Step");
	this.highlightCodeLine(20, false);
	
	// Check if circle exists before highlighting
	if (this.circleID[node]) {
		this.highlightNode(node, QUERY_COLOR);
	}
	
	this.highlightCodeLine(21, true);  // if r < start or end < l
	if (r < start || end < l)
	{
		this.cmd("Step");
		this.highlightCodeLine(21, false);
		this.highlightCodeLine(22, true);  // return 0
		// Add message with indent alignment
		var outsideMsgID = this.nextIndex++;
		this.messageID.push(outsideMsgID);
		this.cmd("CreateLabel", outsideMsgID, "Node " + node + " range [" + start + "," + end + "] outside query, return 0", msgX, this.messageY, 0);
		this.messageY += MSG_LINE_HEIGHT;
		this.cmd("Step");
		this.highlightCodeLine(22, false);
		// Check if circle exists before unhighlighting
		if (this.circleID[node]) {
			this.unhighlightNode(node);
		}
		return 0;
	}
	
	this.highlightCodeLine(23, true);  // if l <= start and end <= r
	if (l <= start && end <= r)
	{
		this.cmd("Step");
		this.highlightCodeLine(23, false);
		this.highlightCodeLine(24, true);  // return tree[node]
		// Add message with indent alignment
		var nodeVal = (this.tree[node] !== undefined && this.tree[node] !== null) ? this.tree[node] : 0;
		var insideMsgID = this.nextIndex++;
		this.messageID.push(insideMsgID);
		this.cmd("CreateLabel", insideMsgID, "Node " + node + " range [" + start + "," + end + "] fully inside query, return " + nodeVal, msgX, this.messageY, 0);
		this.messageY += MSG_LINE_HEIGHT;
		this.cmd("Step");
		this.highlightCodeLine(24, false);
		// Check if circle exists before unhighlighting
		if (this.circleID[node]) {
			this.unhighlightNode(node);
		}
		return nodeVal;
	}
	
	this.highlightCodeLine(25, true);  // mid = (start + end) // 2
	var mid = Math.floor((start + end) / 2);
	this.cmd("Step");
	this.highlightCodeLine(25, false);
	
	this.highlightCodeLine(26, true);  // left_sum
	var left_sum = this._query(node * 2, start, mid, l, r, indent + 1);
	this.highlightCodeLine(26, false);
	
	this.highlightCodeLine(27, true);  // right_sum
	var right_sum = this._query(node * 2 + 1, mid + 1, end, l, r, indent + 1);
	this.highlightCodeLine(27, false);
	
	this.highlightCodeLine(28, true);  // return left_sum + right_sum
	var result = left_sum + right_sum;
	// Add message with indent alignment
	var partialMsgID = this.nextIndex++;
	this.messageID.push(partialMsgID);
	this.cmd("CreateLabel", partialMsgID, "Node " + node + " partial overlap, sum = " + left_sum + " + " + right_sum + " = " + result, msgX, this.messageY, 0);
	this.messageY += MSG_LINE_HEIGHT;
	this.cmd("Step");
	this.highlightCodeLine(28, false);
	
	// Check if circle exists before unhighlighting
	if (this.circleID[node]) {
		this.unhighlightNode(node);
	}
	return result;
}

CCCSegmentTreeTest.prototype.highlightNode = function(node, color)
{
	this.cmd("SetForegroundColor", this.circleID[node], color);
	this.cmd("SetBackgroundColor", this.circleID[node], "#FFFFAA");
}

CCCSegmentTreeTest.prototype.unhighlightNode = function(node)
{
	this.cmd("SetForegroundColor", this.circleID[node], "#000000");
	this.cmd("SetBackgroundColor", this.circleID[node], "#FFFFFF");
}

CCCSegmentTreeTest.prototype.reset = function() {}

CCCSegmentTreeTest.prototype.enableUI = function(event)
{
	if (this.buildButton) this.buildButton.disabled = false;
	if (this.runAllButton) this.runAllButton.disabled = false;
}

CCCSegmentTreeTest.prototype.disableUI = function(event)
{
	if (this.buildButton) this.buildButton.disabled = true;
	if (this.runAllButton) this.runAllButton.disabled = true;
}

var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new CCCSegmentTreeTest(animManag, canvas.width, canvas.height);
}
