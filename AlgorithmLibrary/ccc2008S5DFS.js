// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
// (licence header omitted for brevity — same as original)

var HIGHLIGHT_CIRCLE_COLOR = "#000000";
var DFS_TREE_COLOR         = "#0000FF";

// ── 反应定义 ──────────────────────────────────────────────────────
var REACTIONS = [
	{ name: "AABDD", cost: [2, 1, 0, 2], cond: [2, 1, 0, 2] },  // a>=2,b>=1,d>=2
	{ name: "ABCD",  cost: [1, 1, 1, 1], cond: [1, 1, 1, 1] },  // a>=1,b>=1,c>=1,d>=1
	{ name: "CCD",   cost: [0, 0, 2, 1], cond: [0, 0, 2, 1] },  // c>=2,d>=1
	{ name: "BBB",   cost: [0, 3, 0, 0], cond: [0, 3, 0, 0] },  // b>=3
	{ name: "AD",    cost: [1, 0, 0, 1], cond: [1, 0, 0, 1] }   // a>=1,d>=1
];

var REACTION_SHORT = ["R1", "R2", "R3", "R4", "R5"];
var LEGEND_LINES   = [
	"Legend:",
	"R1: AABDD  (need a>=2,b>=1,d>=2)",
	"R2: ABCD   (need a>=1,b>=1,c>=1,d>=1)",
	"R3: CCD    (need c>=2,d>=1)",
	"R4: BBB    (need b>=3)",
	"R5: AD     (need a>=1,d>=1)"
];

// ── 伪代码 ────────────────────────────────────────────────────────
var CODE = [
	["def dfs(a, b, c, d):"],                                                      // 0
	["    if ", "a>=2 and b>=1 and d>=2", " and dfs(a-2,b-1,c,d-2)==False:"],     // 1  R1条件+调用
	["        return True"],                                                       // 2  R1胜
	["    if ", "a>=1 and b>=1 and c>=1 and d>=1", " and dfs(a-1,b-1,c-1,d-1)==False:"], // 3 R2
	["        return True"],                                                       // 4  R2胜
	["    if ", "c>=2 and d>=1", " and dfs(a,b,c-2,d-1)==False:"],                // 5  R3
	["        return True"],                                                       // 6  R3胜
	["    if ", "b>=3", " and dfs(a,b-3,c,d)==False:"],                           // 7  R4
	["        return True"],                                                       // 8  R4胜
	["    if ", "a>=1 and d>=1", " and dfs(a-1,b,c,d-1)==False:"],                // 9  R5
	["        return True"],                                                       // 10 R5胜
	["    return False"]                                                           // 11 必败
];

// reaction r → 代码行（条件+调用在同一行）
var CODE_IF_LINE     = [1, 3, 5, 7,  9];   // if 条件行
var CODE_RETURN_LINE = [2, 4, 6, 8, 10];   // return True 行

var CODE_START_X     = 10;
var CODE_START_Y     = 10;
var CODE_LINE_HEIGHT = 14;
var CODE_HIGHLIGHT_COLOR = "#FF0000";
var CODE_STANDARD_COLOR  = "#000000";
var CODE_DIMMED_COLOR    = "#AAAAAA";   // 条件不满足时置灰


// ══════════════════════════════════════════════════════════════════
function CCC2008S5DFS(am)
{
	this.init(am);
}

CCC2008S5DFS.prototype = new Algorithm();
CCC2008S5DFS.prototype.constructor = CCC2008S5DFS;
CCC2008S5DFS.superclass = Algorithm.prototype;

// ── addControls ───────────────────────────────────────────────────

CCC2008S5DFS.prototype.addControls = function()
{
	this.startButton = addControlToAlgorithmBar("Button", "Run DFS");
	this.startButton.onclick = this.startCallback.bind(this);
}

// ── init ──────────────────────────────────────────────────────────

CCC2008S5DFS.prototype.init = function(am, w, h)
{
	this.nextIndex = 0;
	CCC2008S5DFS.superclass.init.call(this, am, w, h);
	this.addControls();

	this.generateStateGraph();
	this.animationManager.resetAll();
	this.setupGraph();
}

// ── generateStateGraph ────────────────────────────────────────────
// 只生成非负节点；越界 transition 用 outOfBounds 标记

CCC2008S5DFS.prototype.generateStateGraph = function()
{
	this.states      = [];
	this.stateMap    = {};
	this.transitions = [];

	//var initialState = { a: 3, b: 3, c: 3, d: 3 };
	var initialState = { a: 4, b: 4, c: 5, d: 5 };
	this.addState(initialState);

	var queue   = [0];
	var visited = { "4,4,5,5": true };

	while (queue.length > 0)
	{
		var stateIdx = queue.shift();
		var state    = this.states[stateIdx];

		for (var r = 0; r < REACTIONS.length; r++)
		{
			var reaction = REACTIONS[r];
			var cond     = reaction.cond;

			// 先检查条件（对应新版 dfs 里的 if a>=... 判断）
			var condMet = (state.a >= cond[0] && state.b >= cond[1] &&
			               state.c >= cond[2] && state.d >= cond[3]);

			if (!condMet)
			{
				// 条件不满足，记录一条 condFail transition
				this.transitions.push({
					from: stateIdx, to: -1,
					reaction: r, condFail: true, outOfBounds: false
				});
				continue;
			}

			var newState = {
				a: state.a - reaction.cost[0],
				b: state.b - reaction.cost[1],
				c: state.c - reaction.cost[2],
				d: state.d - reaction.cost[3]
			};

			// 条件已保证非负，所以 outOfBounds 不会出现
			// （保留字段兼容旧代码）
			var key = newState.a + "," + newState.b + "," +
			          newState.c + "," + newState.d;
			var newIdx;
			if (!visited[key])
			{
				visited[key] = true;
				newIdx = this.addState(newState);
				queue.push(newIdx);
			}
			else
			{
				newIdx = this.stateMap[key];
			}
			this.transitions.push({
				from: stateIdx, to: newIdx,
				reaction: r, condFail: false, outOfBounds: false
			});
		}
	}
}

CCC2008S5DFS.prototype.addState = function(state)
{
	var idx = this.states.length;
	this.states.push(state);
	var key = state.a + "," + state.b + "," + state.c + "," + state.d;
	this.stateMap[key] = idx;
	return idx;
}

// ── setupGraph ────────────────────────────────────────────────────

CCC2008S5DFS.prototype.setupGraph = function()
{
	this.commands      = new Array();
	this.circleID      = new Array(this.states.length);
	this.stateLabelID  = new Array(this.states.length);
	this.resultLabelID = new Array(this.states.length);
	this.nodeCreated   = new Array(this.states.length).fill(false); // 是否已画出

	// ── 伪代码标签（在 resetAll 之后创建，不会被清除）────────────
	this.codeID = new Array(CODE.length);
	for (var i = 0; i < CODE.length; i++)
	{
		this.codeID[i] = new Array(CODE[i].length);
		for (var j = 0; j < CODE[i].length; j++)
		{
			this.codeID[i][j] = this.nextIndex++;
			this.cmd("CreateLabel",
				this.codeID[i][j], CODE[i][j],
				CODE_START_X,
				CODE_START_Y + i * CODE_LINE_HEIGHT,
				0);
			this.cmd("SetForegroundColor", this.codeID[i][j], CODE_STANDARD_COLOR);
			if (j > 0)
				this.cmd("AlignRight", this.codeID[i][j], this.codeID[i][j - 1]);
		}
	}

	this.calculateTreePositions();

	// ── 只画根节点（idx=0）────────────────────────────────────────
	this.createNode(0);

	// ── 图例（伪代码下方）────────────────────────────────────────
	this.legendIDs = [];
	var legendX = CODE_START_X;
	var legendY  = CODE_START_Y + CODE.length * CODE_LINE_HEIGHT + 40;
	for (var i = 0; i < LEGEND_LINES.length; i++)
	{
		var lid = this.nextIndex++;
		this.legendIDs.push(lid);
		this.cmd("CreateLabel", lid, LEGEND_LINES[i], legendX, legendY + i * 13, 0);
		this.cmd("SetForegroundColor", lid, (i === 0) ? "#000000" : "#555555");
	}

	animationManager.setAllLayers([0, 1]);
	animationManager.StartNewAnimation(this.commands);
	animationManager.skipForward();
	animationManager.clearHistory();

	this.highlightCircleL = this.nextIndex++;
}

// ── 动态创建单个节点（圆 + 状态标签 + 结果标签）─────────────────

CCC2008S5DFS.prototype.createNode = function(idx)
{
	if (this.nodeCreated[idx]) return;
	this.nodeCreated[idx] = true;

	var x     = this.statePositions[idx].x;
	var y     = this.statePositions[idx].y;
	var state = this.states[idx];
	var label = state.a + "," + state.b + "," + state.c + "," + state.d;

	this.circleID[idx] = this.nextIndex++;
	this.cmd("CreateCircle", this.circleID[idx], "", x, y);
	this.cmd("SetRadius", this.circleID[idx], 25);

	this.stateLabelID[idx] = this.nextIndex++;
	this.cmd("CreateLabel", this.stateLabelID[idx], label, x, y);
	this.cmd("SetTextColor", this.stateLabelID[idx], "#0000FF");

	this.resultLabelID[idx] = this.nextIndex++;
	this.cmd("CreateLabel", this.resultLabelID[idx], "", x, y + 30);
}

// ── calculateTreePositions ────────────────────────────────────────

CCC2008S5DFS.prototype.calculateTreePositions = function()
{
	this.statePositions = new Array(this.states.length);

	var children = new Array(this.states.length);
	for (var i = 0; i < this.states.length; i++)
		children[i] = [];
	for (var i = 0; i < this.transitions.length; i++)
	{
		var trans = this.transitions[i];
		if (!trans.condFail && !trans.outOfBounds)
			children[trans.from].push(trans.to);
	}

	var depth        = new Array(this.states.length).fill(-1);
	var breadth      = new Array(this.states.length).fill(0);
	var nodesAtDepth = [];
	var countAtDepth = [];
	var queue        = [{ idx: 0, depth: 0 }];
	depth[0] = 0;

	while (queue.length > 0)
	{
		var cur = queue.shift();
		var idx = cur.idx;
		var d   = cur.depth;

		if (countAtDepth[d] === undefined) countAtDepth[d] = 0;
		if (!nodesAtDepth[d])              nodesAtDepth[d] = [];

		breadth[idx] = countAtDepth[d]++;
		nodesAtDepth[d].push(idx);

		for (var i = 0; i < children[idx].length; i++)
		{
			var childIdx = children[idx][i];
			if (depth[childIdx] === -1)
			{
				depth[childIdx] = d + 1;
				queue.push({ idx: childIdx, depth: d + 1 });
			}
		}
	}

	var startX      = 600;
	var startY      = 25;
	var levelHeight = 130;

	var maxNodes = 0;
	for (var d = 0; d < nodesAtDepth.length; d++)
		if (nodesAtDepth[d]) maxNodes = Math.max(maxNodes, nodesAtDepth[d].length);
	var nodeSpacing = Math.min(250, 1100 / (maxNodes + 1));

	for (var i = 0; i < this.states.length; i++)
	{
		var d          = depth[i];
		var b          = breadth[i];
		var n          = nodesAtDepth[d].length;
		var totalWidth = (n - 1) * nodeSpacing;
		var x          = startX - totalWidth / 2 + b * nodeSpacing;
		var y          = startY + d * levelHeight;
		this.statePositions[i] = { x: x, y: y };
	}
}

// ── 辅助：整行代码高亮/恢复 ──────────────────────────────────────

CCC2008S5DFS.prototype.highlightCodeLine = function(lineIdx, on)
{
	var color = on ? CODE_HIGHLIGHT_COLOR : CODE_STANDARD_COLOR;
	for (var j = 0; j < this.codeID[lineIdx].length; j++)
		this.cmd("SetForegroundColor", this.codeID[lineIdx][j], color);
}

// 条件不满足时置灰某行
CCC2008S5DFS.prototype.dimCodeLine = function(lineIdx, on)
{
	var color = on ? CODE_DIMMED_COLOR : CODE_STANDARD_COLOR;
	for (var j = 0; j < this.codeID[lineIdx].length; j++)
		this.cmd("SetForegroundColor", this.codeID[lineIdx][j], color);
}

// ── DFS 入口 ──────────────────────────────────────────────────────

CCC2008S5DFS.prototype.startCallback = function(event)
{
	this.implementAction(this.doDFS.bind(this), "");
}

CCC2008S5DFS.prototype.doDFS = function()
{
	this.resultCache = {};
	this.visitingSet = {};
	this.commands    = new Array();
	this.messageID   = new Array();
	this.messageY    = 10;          // 消息区起始 y（所有消息共享，动态增减）

	this.cmd("CreateHighlightCircle", this.highlightCircleL,
		HIGHLIGHT_CIRCLE_COLOR, this.getXPos(0), this.getYPos(0));
	this.cmd("SetLayer", this.highlightCircleL, 2);

	var result = this.dfsVisit(0, 0);  // indent=0，实际 x = MSG_BASE_X + 0

	this.cmd("Delete", this.highlightCircleL);

	var resultID = this.nextIndex++;
	var msg = result
		? "Patrick wins!  dfs = True"
		: "Roland wins!   dfs = False";
	this.cmd("CreateLabel", resultID, msg, 700, 10, 0);
	this.cmd("SetForegroundColor", resultID, result ? "#0000FF" : "#FF0000");
	this.cmd("Step");

	return this.commands;
}

CCC2008S5DFS.prototype.getXPos = function(i) { return this.statePositions[i].x; }
CCC2008S5DFS.prototype.getYPos = function(i) { return this.statePositions[i].y; }

// ── 递归 DFS ──────────────────────────────────────────────────────
//   indent：缩进层级（每深一层 +1），实际 x = 500 + indent * 14

var MSG_BASE_X   = 1050;   // 消息区固定起始 x
var MSG_INDENT_W = 30;    // 每层缩进宽度
var MSG_LINE_H   = 15;    // 每行消息高度

CCC2008S5DFS.prototype.dfsVisit = function(stateIdx, indent)
{
	// 记忆化
	if (this.resultCache[stateIdx] !== undefined)
		return this.resultCache[stateIdx];

	var state  = this.states[stateIdx];
	var label  = state.a + "," + state.b + "," + state.c + "," + state.d;
	var msgX   = MSG_BASE_X + indent * MSG_INDENT_W;

	// ── 函数调用标签（永久保留，不删除）────────────────────────────
	var callMsgID = this.nextIndex++;
	this.messageID.push(callMsgID);
	this.cmd("CreateLabel", callMsgID, "dfs(" + label + ")", msgX, this.messageY, 0);
	this.messageY += MSG_LINE_H;
	this.cmd("Step");

	// 节点标记为"正在处理"（橙色）
	this.cmd("SetTextColor", this.stateLabelID[stateIdx], "#FF8800");

	// ── 依次尝试 5 个反应 ─────────────────────────────────────────
	for (var r = 0; r < REACTIONS.length; r++)
	{
		var reaction = REACTIONS[r];
		var cond     = reaction.cond;

		// 高亮 if 行
		this.highlightCodeLine(CODE_IF_LINE[r], true);
		this.cmd("Step");

		var condMet = (state.a >= cond[0] && state.b >= cond[1] &&
		               state.c >= cond[2] && state.d >= cond[3]);

		if (!condMet)
		{
			// 条件不满足：显示临时消息，删除后 y 退回
			this.highlightCodeLine(CODE_IF_LINE[r], false);
			this.dimCodeLine(CODE_IF_LINE[r], true);

			var yBefore   = this.messageY;       // ← 记录删除前的 y
			var skipMsgID = this.nextIndex++;
			this.messageID.push(skipMsgID);
			this.cmd("CreateLabel", skipMsgID,
				REACTION_SHORT[r] + " cond not met",
				msgX, this.messageY, 0);
			this.cmd("SetForegroundColor", skipMsgID, "#AAAAAA");
			this.messageY += MSG_LINE_H;
			this.cmd("Step");
			this.cmd("Delete", skipMsgID);
			this.messageY = yBefore;             // ← 退回 y

			this.dimCodeLine(CODE_IF_LINE[r], false);
			continue;
		}

		// 找对应 transition
		var neighborIdx = -1;
		for (var i = 0; i < this.transitions.length; i++)
		{
			if (this.transitions[i].from     === stateIdx &&
			    this.transitions[i].reaction  === r &&
			    !this.transitions[i].condFail)
			{
				neighborIdx = this.transitions[i].to;
				break;
			}
		}

		if (neighborIdx === -1)
		{
			this.highlightCodeLine(CODE_IF_LINE[r], false);
			continue;
		}

		// ── 动态创建子节点和边（如果还没画过）────────────────────
		this.createNode(neighborIdx);
		this.cmd("Connect",
			this.circleID[stateIdx],
			this.circleID[neighborIdx],
			"#000000", 0, 1, REACTION_SHORT[r]);
		this.cmd("Step");

		var subResult;

		if (this.resultCache[neighborIdx] !== undefined)
		{
			// 命中缓存：高亮已有边，显示临时消息，删除后 y 退回
			subResult = this.resultCache[neighborIdx];
			this.cmd("SetEdgeHighlight",
				this.circleID[stateIdx], this.circleID[neighborIdx], 1);
			var yBefore    = this.messageY;
			var cacheMsgID = this.nextIndex++;
			this.messageID.push(cacheMsgID);
			this.cmd("CreateLabel", cacheMsgID,
				"dfs(" + this.stateLabel(neighborIdx) + ")=" +
				subResult + " (cached)",
				msgX, this.messageY, 0);
			this.cmd("SetForegroundColor", cacheMsgID, "#888888");
			this.messageY += MSG_LINE_H;
			this.cmd("Step");
			this.cmd("SetEdgeHighlight",
				this.circleID[stateIdx], this.circleID[neighborIdx], 0);
			this.cmd("Delete", cacheMsgID);
			this.messageY = yBefore;
		}
		else
		{
			// 高亮新建的边，移动 highlight circle，递归
			this.cmd("SetEdgeHighlight",
				this.circleID[stateIdx], this.circleID[neighborIdx], 1);
			this.cmd("Move", this.highlightCircleL,
				this.getXPos(neighborIdx), this.getYPos(neighborIdx));
			this.cmd("Step");
			this.cmd("SetEdgeHighlight",
				this.circleID[stateIdx], this.circleID[neighborIdx], 0);

			subResult = this.dfsVisit(neighborIdx, indent + 1);

			// 返回消息：临时，删除后 y 退回
			var yBefore  = this.messageY;
			var retMsgID = this.nextIndex++;
			this.messageID.push(retMsgID);
			this.cmd("CreateLabel", retMsgID,
				"Return dfs(" + this.stateLabel(neighborIdx) + ")=" + subResult,
				msgX, this.messageY, 0);
			this.messageY += MSG_LINE_H;
			this.cmd("Move", this.highlightCircleL,
				this.getXPos(stateIdx), this.getYPos(stateIdx));
			this.cmd("Step");
			this.cmd("Delete", retMsgID);
			this.messageY = yBefore;

			// 子节点已确定结果，边颜色改为蓝色（树边）
			this.cmd("SetEdgeColor",
				this.circleID[stateIdx], this.circleID[neighborIdx],
				DFS_TREE_COLOR);
		}

		this.highlightCodeLine(CODE_IF_LINE[r], false);

		if (subResult === false)
		{
			// 必胜
			this.highlightCodeLine(CODE_RETURN_LINE[r], true);
			this.cmd("SetTextColor", this.stateLabelID[stateIdx], "#0000FF");
			this.cmd("SetText", this.resultLabelID[stateIdx], "True");
			this.cmd("SetForegroundColor", this.resultLabelID[stateIdx], "#0000FF");
			this.cmd("Step");
			this.highlightCodeLine(CODE_RETURN_LINE[r], false);
			this.resultCache[stateIdx] = true;
			return true;
		}
	}

	// 必败
	this.highlightCodeLine(11, true);
	this.cmd("SetTextColor", this.stateLabelID[stateIdx], "#FF0000");
	this.cmd("SetText", this.resultLabelID[stateIdx], "False");
	this.cmd("SetForegroundColor", this.resultLabelID[stateIdx], "#FF0000");
	this.cmd("Step");
	this.highlightCodeLine(11, false);
	this.resultCache[stateIdx] = false;
	return false;
}

// ── 辅助：取节点的状态字符串 ─────────────────────────────────────

CCC2008S5DFS.prototype.stateLabel = function(idx)
{
	var s = this.states[idx];
	return s.a + "," + s.b + "," + s.c + "," + s.d;
}

// ── Reset / UI ────────────────────────────────────────────────────

CCC2008S5DFS.prototype.reset = function() {}

CCC2008S5DFS.prototype.enableUI = function(event)
{
	if (this.startButton) this.startButton.disabled = false;
}

CCC2008S5DFS.prototype.disableUI = function(event)
{
	if (this.startButton) this.startButton.disabled = true;
}

var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new CCC2008S5DFS(animManag, canvas.width, canvas.height);
}