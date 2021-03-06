'use strict';

var jsCRiPS = {};

/*global esprima,console,escodegen*/
jsCRiPS.converter = {};
jsCRiPS.debugConverter = {};
jsCRiPS.blockMehods = [];

jsCRiPS.addBlockMethods = function (methodName) {
    jsCRiPS.blockMehods.add(methodName);
};
jsCRiPS.addBlockMethods('input');

jsCRiPS.isBlockMethods = function (methodName) {
    return jsCRiPS.blockMehods.indexOf(methodName) >= 0;
};

jsCRiPS.debugWait = function () {
    jsCRiPS.th = Thread.create(function () {    //  入力待ち用にスレッドを生成
        if (!jsCRiPS.withKame) {
            return;
        }
        var startTime = new Date();
        if (jsCRiPS.isBreakPoint) {
            jsCRiPS.autoStart(false);
        }
        while (!jsCRiPS.debugReady) {
            Thread.sleep(1);
            if (!jsCRiPS.AutoMode) {
                for (var i = 0; i < jsCRiPS.stepButton.length; i++) {
                    jsCRiPS.stepButton[i].disabled = false;
                    jsCRiPS.stepButton[i].style.opacity = 1;
                }
            } else if (jsCRiPS.AutoMode && ((new Date() - startTime) >= jsCRiPS.AutoSpeed)) {
                jsCRiPS.debugReady = true;
            }
        }
        jsCRiPS.debugReady = false;
        if (!jsCRiPS.AutoMode) {
            for (var i = 0; i < jsCRiPS.stepButton.length; i++) {
                jsCRiPS.stepButton[i].disabled = true;
                jsCRiPS.stepButton[i].style.opacity = 0.7;
            }
        }
    });
};

jsCRiPS.debugVariablePrint = function () {
    jsCRiPS.debugVariablePrintHelper = function (table, stack, color) {
        var argValues = '';
        for (var i = 0; i < stack.args.length; i++) {
            argValues += stack.args[i];
            if ((i + 1) < stack.args.length) {
                argValues += ',';
            }
        }
        var position = stack.path + '(' + argValues + ')';
        position = (position === '()') ? 'Global' : position;
        for (var i = 0; i < stack.vDecls.length; i++) {
            var newRow = table.insertRow(-1);

            var tdName = document.createElement('td');
            tdName.innerHTML = stack.vDecls[i][0];
            tdName.style.backgroundColor = color;

            var tdValue = document.createElement('td');
            var v = stack.vDecls[i][1];
            var prevV = stack.vDecls[i][3];
            // Turtleなら座標と角度を表示
            var valueStr = "";
            if (v && jsCRiPS.isDefined(v._looks)) {
                valueStr = '<img src=\'../test/img/turtle.png\'>';
            } else {
                valueStr = jsCRiPS.isUndefined(prevV) ? v : prevV + " -> " + v;
            }
            tdValue.innerHTML = valueStr;
            // 初めて生成される変数なら黄色くする
            var vcolor = (stack.vDecls[i][2]) ? '#EE3' : color;
            stack.vDecls[i][2] = false;
            tdValue.style.backgroundColor = vcolor;

            var tdType = document.createElement('td');
            tdType.innerHTML = (typeof stack.vDecls[i][1]);
            tdType.style.backgroundColor = color;

            var tdPos = document.createElement('td');
            tdPos.innerHTML = position;
            tdPos.style.backgroundColor = color;

            newRow.appendChild(tdName);
            newRow.appendChild(tdValue);
            newRow.appendChild(tdType);
            newRow.appendChild(tdPos);
        }
    };

    // 毎回テーブルを作成し直す
    // テーブルの削除
    for (var i = 0; i < jsCRiPS.globalVariableTable.length; i++) {
        while (jsCRiPS.globalVariableTable[i].rows[1]) {
            jsCRiPS.globalVariableTable[i].deleteRow(1);
        }
    }
    for (var i = 0; i < jsCRiPS.localVariableTable.length; i++) {
        while (jsCRiPS.localVariableTable[i].rows[1]) {
            jsCRiPS.localVariableTable[i].deleteRow(1);
        }
    }

    // GlobalVariableTableの更新
    for (var i = 0; i < jsCRiPS.globalVariableTable.length; i++) {
        jsCRiPS.debugVariablePrintHelper(jsCRiPS.globalVariableTable[i], jsCRiPS.callStack[0], '#FFF');
    }

    // LocalVariableTableの更新にはコールスタック毎に行を追加してく
    for (var i = 1; i < jsCRiPS.callStack.length; i++) {
        var color = (i === jsCRiPS.callStack.length - 1) ? '#FFF' : '#CCC';
        for (var j = 0; j < jsCRiPS.localVariableTable.length; j++) {
            jsCRiPS.debugVariablePrintHelper(jsCRiPS.localVariableTable[j], jsCRiPS.callStack[i], color);
        }
    }
};

jsCRiPS.addVariable = function (stmt, name, idx) {
    jsCRiPS.addVariableHelper = function (name, value) {
        var lastIdx = jsCRiPS.callStack.length - 1;
        jsCRiPS.callStack[lastIdx].addVariable(name, value, true);
    };
    if (!jsCRiPS.withDebug) {
        return;
    } else if (jsCRiPS.isDefined(idx)) {
        stmt.splice(idx, 0, esprima.parse('jsCRiPS.addVariableHelper(\'' + name + '\',' + name + ');').body[0]);
    } else {
        stmt.push(esprima.parse('jsCRiPS.addVariableHelper(\'' + name + '\',' + name + ');').body[0]);
    }
};

jsCRiPS.addArgument = function (stmt, name, idx) {
    jsCRiPS.addArgumentHelper = function (name, value) {
        var lastIdx = jsCRiPS.callStack.length - 1;
        jsCRiPS.callStack[lastIdx].addArgument(name, value);
    };
    if (jsCRiPS.isDefined(idx)) {
        stmt.splice(idx, 0, esprima.parse('jsCRiPS.addArgumentHelper(\'' + name + '\',' + name + ');').body[0]);
    } else {
        stmt.push(esprima.parse('jsCRiPS.addArgumentHelper(\'' + name + '\',' + name + ');').body[0]);
    }
};

jsCRiPS.updateVariable = function (stmt, name, idx) {
    jsCRiPS.updateVariableHelper = function (name, value) {
        var lastIdx = jsCRiPS.callStack.length - 1;
        jsCRiPS.callStack[lastIdx].updateVariable(name, value, true);
    };
    if (!jsCRiPS.withDebug) {
        return;
    } else if (jsCRiPS.isDefined(idx)) {
        stmt.splice(idx, 0, esprima.parse('jsCRiPS.updateVariableHelper(\'' + name + '\',' + name + ');').body[0]);
    } else {
        stmt.push(esprima.parse('jsCRiPS.updateVariableHelper(\'' + name + '\',' + name + ');').body[0]);
    }
};

// ネストした関数に未対応
jsCRiPS.pushCallStack = function (stmt, name) {
    jsCRiPS.functionNames.push(name);
    stmt.unshift(esprima.parse('jsCRiPS.callStack.push(makeCallStack(\'' + name + '\'));').body[0]);
};

jsCRiPS.popCallStack = function (stmt, idx) {
    jsCRiPS.popCallStackHelper = function () {
        jsCRiPS.callStack.pop();
    };
    if (jsCRiPS.isDefined(idx)) {
        stmt.splice(idx, 0, esprima.parse('jsCRiPS.popCallStackHelper();').body[0]);
    } else {
        stmt.push(esprima.parse('jsCRiPS.popCallStackHelper();').body[0]);
    }
};

function makeCallStack(path) {
    var ret = {};
    ret.args = [];
    ret.path = path;
    ret.vDecls = [];

    ret.addArgument = function (name, value) {
        ret.args.push(value);
        ret.addVariable(name, value, true);
    };

    ret.addVariable = function (name, value, isNew) {
        var alreadyDeclared = false;
        for (var i = 0; i < ret.vDecls.length; i++) {
            alreadyDeclared = (alreadyDeclared || ret.vDecls[i][0] === name);
        }
        if (alreadyDeclared) {
            ret.updateVariable(name, value, isNew);
        } else {
            ret.vDecls.push([name, value, isNew]);
        }
    };

    ret.updateVariable = function (name, value, isNew) {
        var find = false;
        for (var i = 0; i < ret.vDecls.length; i++) {
            if (ret.vDecls[i][0] === name) {
                ret.vDecls[i][3] = ret.vDecls[i][1]; // 前の値を保持
                ret.vDecls[i][1] = value;
                ret.vDecls[i][2] = isNew;
                find = true;
            }
        }
        if (ret !== jsCRiPS.callStack[0] && !find) {    // may be Global variable
            jsCRiPS.callStack[0].updateVariable(name, value, isNew);
        } else if (ret === jsCRiPS.callStack[0] && !find) { // declared
            ret.addVariable(name, value, true);
        }
    };

    ret.toString = function () {
        var argValues = '';
        for (var i = 0; i < ret.args.length; i++) {
            argValues += ret.args[i];
            if ((i + 1) < ret.args.length) {
                argValues += ',';
            }
        }
        return ret.path + '(' + argValues + ')';
    };

    return ret;
}

jsCRiPS.setHighlight = function (startLine, endLine, type) {
    jsCRiPS.editor.setHighlight(startLine, endLine, type);
};

jsCRiPS.removeHighlight = function () {
    jsCRiPS.editor.removeHighlight();
};

// 高速化のため、汚いコード
jsCRiPS.debugConverter.convert = function (source) {
    // 空白行に対するBreakpointへ対応する場合、ただし"{"のみの行など空白行以外でも対応できないBreakpointが発生してしまうので中途半端
    //var lines = source.split(/\r\n|\r|\n/);
    //jsCRiPS.dummy = function(){return 1;};
    //source = '';
    //for (var i = 0; i < lines.length; i++) {
    //    source += ((lines[i] === '') ? 'jsCRiPS.dummy();' : lines[i]) + '\r\n';
    //}
    var ast = esprima.parse(source, {loc: true});
    var yieldAST = jsCRiPS.withKame ? {
        "type": "ExpressionStatement",
        "expression": {
            "type": "CallExpression",
            "callee": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "Identifier",
                        "name": "jsCRiPS"
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "th"
                    }
                },
                "property": {
                    "type": "Identifier",
                    "name": "join"
                }
            },
            "arguments": []
        }
    } : {
        "type": "EmptyStatement"
    };
    // esprima.parse('jsCRiPS.th.join();').body[0] : esprima.parse(';').body[0]
    var debugVariablePrint = {
        "type": "ExpressionStatement",
        "expression": {
            "type": "CallExpression",
            "callee": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                    "type": "Identifier",
                    "name": "jsCRiPS"
                },
                "property": {
                    "type": "Identifier",
                    "name": "debugVariablePrint"
                }
            },
            "arguments": []
        }
    }; // esprima.parse('jsCRiPS.debugVariablePrint();').body[0];
    var debugWait = {
        "type": "ExpressionStatement",
        "expression": {
            "type": "CallExpression",
            "callee": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                    "type": "Identifier",
                    "name": "jsCRiPS"
                },
                "property": {
                    "type": "Identifier",
                    "name": "debugWait"
                }
            },
            "arguments": []
        }
    }; // esprima.parse('jsCRiPS.debugWait();').body[0];

    function pushDebugStatement(stmt, line, end, idx) {

        var block;
        if (jsCRiPS.withDebug) {
            // pushを回避することで、自分の環境で1回あたり0.01ms程度速度改善
            block = {
                "type": "BlockStatement",
                "body": [{
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "CallExpression",
                        "callee": {
                            "type": "MemberExpression",
                            "computed": false,
                            "object": {
                                "type": "Identifier",
                                "name": "jsCRiPS"
                            },
                            "property": {
                                "type": "Identifier",
                                "name": "setHighlight"
                            }
                        },
                        "arguments": [
                            {
                                "type": "Literal",
                                "value": line - 1
                            },
                            {
                                "type": "Literal",
                                "value": end - 1
                            }
                        ]
                    }
                }, debugVariablePrint, {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "AssignmentExpression",
                        "operator": "=",
                        "left": {
                            "type": "MemberExpression",
                            "computed": false,
                            "object": {
                                "type": "Identifier",
                                "name": "jsCRiPS"
                            },
                            "property": {
                                "type": "Identifier",
                                "name": "isBreakPoint"
                            }
                        },
                        "right": {
                            "type": "BinaryExpression",
                            "operator": "!==",
                            "left": {
                                "type": "CallExpression",
                                "callee": {
                                    "type": "MemberExpression",
                                    "computed": false,
                                    "object": {
                                        "type": "MemberExpression",
                                        "computed": false,
                                        "object": {
                                            "type": "Identifier",
                                            "name": "jsCRiPS"
                                        },
                                        "property": {
                                            "type": "Identifier",
                                            "name": "breakPoints"
                                        }
                                    },
                                    "property": {
                                        "type": "Identifier",
                                        "name": "indexOf"
                                    }
                                },
                                "arguments": [
                                    {
                                        "type": "Literal",
                                        "value": line - 1
                                    }
                                ]
                            },
                            "right": {
                                "type": "UnaryExpression",
                                "operator": "-",
                                "argument": {
                                    "type": "Literal",
                                    "value": 1
                                },
                                "prefix": true
                            }
                        }
                    }
                }, debugWait, yieldAST]
            };
            // var block = esprima.parse('{}').body[0]
            // block.body.push(esprima.parse('jsCRiPS.setHighlight(' + (line - 1) + ',' + (end - 1) + ');').body[0]);
            // block.body.push(debugVariablePrint);
            // なぜかdebugWaitの引数として渡せない(undefinedになる)ので、グローバル変数にbreakpointの情報を持たせる
            // block.body.push(esprima.parse('jsCRiPS.isBreakPoint = jsCRiPS.breakPoints.indexOf(' + (line - 1) + ') !== -1;').body[0]);
            // block.body.push(debugWait);
            // block.body.push(yieldAST);
        }
        if (jsCRiPS.isDefined(idx)) {
            stmt.splice(idx, 0, block);
        } else {
            stmt.push(block);
        }
    }

    function pushInputExpression(pushed, left) {
        pushed.push({
            "type": "ExpressionStatement",
            "expression": {
                "type": "CallExpression",
                "callee": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": {
                            "type": "Identifier",
                            "name": "jsCRiPS"
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "th"
                        }
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "join"
                    }
                },
                "arguments": []
            }
        }); // esprima.parse('jsCRiPS.th.join();').body[0]
        pushed.push(esprima.parse(left + ' = jsCRiPS.inputText;').body[0]);
    }

    //for debug
    document.getElementById('ast').value = JSON.stringify(ast, null, 4);

    var processStatement = function (stmt) {
        if (stmt.type === 'BlockStatement') {
            stmt.body = processStatements(stmt.body);
        } else if (stmt.type === 'IfStatement') {
            if (stmt.consequent) {  // if
                stmt.consequent = processStatement(stmt.consequent);
                var block1 = {
                    "type": "BlockStatement",
                    "body": []
                }; // esprima.parse('{}').body[0]
                pushDebugStatement(block1.body, stmt.test.loc.start.line, stmt.test.loc.end.line);
                block1.body.push(stmt);
                stmt = block1;
            }
            if (stmt.alternate) {   // else
                stmt.alternate = processStatement(stmt.alternate);
                var block2 = {
                    "type": "BlockStatement",
                    "body": []
                }; // esprima.parse('{}').body[0]
                pushDebugStatement(block2.body, stmt.test.loc.start.line, stmt.test.loc.end.line);
                block2.body.push(stmt);
                stmt = block2;

            } else if (stmt.body.length > 0 && stmt.body[1].alternate) {   // else ifが連なった場合
                stmt.body[1].alternate = processStatement(stmt.body[1].alternate);
            }
        } else if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'CallExpression') {
            return newAssignmentBlock(stmt);
        } else if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'AssignmentExpression' &&
            stmt.expression.right.type === 'CallExpression') {
            return newAssignmentBlock(stmt, stmt.expression.left.name, jsCRiPS.isBlockMethods(stmt.expression.right.callee.name));
        } else if (stmt.type === 'VariableDeclaration' && stmt.declarations[0].init &&
            stmt.declarations[0].init.type === 'CallExpression') {
            return newAssignmentBlock(stmt, stmt.declarations[0].id.name, jsCRiPS.isBlockMethods(stmt.declarations[0].init.callee.name));
        }
        return stmt;

        function newAssignmentBlock(node, left, isInput) {
            var block = {
                "type": "BlockStatement",
                "body": [stmt]
            };
            if (isInput && left) {
                pushInputExpression(block.body, left);
            } else {
                block.body.push(yieldAST);
            }
            jsCRiPS.updateVariable(block.body, left);
            pushDebugStatement(block.body, node.loc.start.line, node.loc.end.line);
            return block;
        }

    };

    var processStatements = function (stmts) {
        var newStmts = [];
        var updateVars = new Set();// 同じ変数を2回更新しないようにするため
        var i, j;
        for (i = 0; i < stmts.length; i = (i + 1) | 0) {
            var each = stmts[i];
            if (each.type === 'BlockStatement') {
                each.body = processStatements(each.body);
            } else if (each.type === 'IfStatement') {
                if (each.consequent) {  // if
                    pushDebugStatement(newStmts, each.test.loc.start.line, each.test.loc.end.line);
                    each.consequent = processStatement(each.consequent);
                }
                if (each.alternate) {   // else (if)
                    each.alternate = processStatement(each.alternate);
                }
            } else if (each.type === 'WhileStatement') {
                each.body = processStatement(each.body);
            } else if (each.type === 'ForStatement') {
                pushDebugStatement(newStmts, each.loc.start.line, each.loc.end.line);
                if (each.init.type === 'VariableDeclaration') { // for(var i = 0,j = 0; ....)
                    for (j = 0; j < each.init.declarations.length; j = (j + 1) | 0) {
                        jsCRiPS.addVariable(newStmts, each.init.declarations[j].id.name);
                    }
                }
                each.body = processStatement(each.body);
                var block = {
                    "type": "BlockStatement",
                    "body": []
                };

                if (each.init.type === 'VariableDeclaration') { // for(var i = 0,j = 0; ....)
                    for (j = 0; j < each.init.declarations.length; j = (j + 1) | 0) {
                        updateVars.add(each.init.declarations[j].id.name);
                    }
                }
                if (each.update.type === 'UpdateExpression') {
                    updateVars.add(each.update.argument.name);
                } else if (each.update.type === 'SequenceExpression') {
                    for (j = 0; j < each.update.expressions.length; j = (j + 1) | 0) {
                        if (each.update.expressions[j].type === 'UpdateExpression') {
                            updateVars.add(each.update.expressions[j].argument.name);
                        } else if (each.update.expressions[j].type === 'AssignmentExpression') {
                            updateVars.add(each.update.expressions[j].left.name);
                        }
                    }
                }
                for (let vName of updateVars) {
                    jsCRiPS.updateVariable(block.body, vName);
                }
                block.body.push(each.body);
                each.body = block;
            } else if (each.type === 'FunctionDeclaration') {
                each.body = processStatement(each.body);
                if (each.body.type === 'BlockStatement') {
                    var lastLine = (each.params.length === 0) ?
                        each.id.loc.end.line : each.params[each.params.length - 1].loc.end.line;
                    if (each.params.length !== 0) {
                        for (j = 0; j < each.params.length; j = (j + 1) | 0) {
                            jsCRiPS.addArgument(each.body.body, each.params[j].name, j);
                            lastLine = each.params[j].loc.end.line;
                        }
                    }
                    pushDebugStatement(each.body.body, each.id.loc.start.line, lastLine, 0);
                    jsCRiPS.popCallStack(each.body.body);
                    // 最後に先頭に挿入する必要あり
                    jsCRiPS.pushCallStack(each.body.body, each.id.name);
                }
            }

            newStmts.push(each);
            for (let vName of updateVars) {
                jsCRiPS.updateVariable(newStmts, vName);
            }
            updateVars.clear();

            if (each.type === 'ExpressionStatement' && each.expression.type === 'CallExpression') {
                pushDebugStatement(newStmts, each.expression.callee.loc.start.line, each.expression.callee.loc.end.line, newStmts.length - 1);
                newStmts.push(yieldAST);
            } else if (each.type === 'ExpressionStatement' && each.expression.type === 'AssignmentExpression' &&
                each.expression.right.type === 'CallExpression') {
                pushDebugStatement(newStmts, each.expression.loc.start.line, each.expression.loc.end.line, newStmts.length - 2);
                // var x=input(),y=input() や f(input()) や if(input()=='abc')などには未対応
                if (jsCRiPS.isBlockMethods(each.expression.right.callee.name)) {  // inputの場合は必ずjoinする
                    pushInputExpression(newStmts, each.expression.left.name);
                } else {
                    newStmts.push(yieldAST);
                }
                jsCRiPS.updateVariable(newStmts, each.expression.left.name);
            } else if (each.type === 'VariableDeclaration') {
                if (each.declarations[0].init && each.declarations[0].init.type === 'CallExpression') {
                    pushDebugStatement(newStmts, each.declarations[0].loc.start.line, each.declarations[each.declarations.length - 1].loc.end.line, newStmts.length - 1);
                    if (jsCRiPS.isBlockMethods(each.declarations[0].init.callee.name)) {    // inputの場合は必ずjoinする
                        pushInputExpression(newStmts, each.declarations[0].id.name);
                    } else {
                        newStmts.push(yieldAST);
                    }
                } else {
                    pushDebugStatement(newStmts, each.declarations[0].loc.start.line, each.declarations[each.declarations.length - 1].loc.end.line, newStmts.length - 1);
                }
                for (j = 0; j < each.declarations.length; j = (j + 1) | 0) {
                    jsCRiPS.addVariable(newStmts, each.declarations[j].id.name);
                }
            } else if (each.type === 'ReturnStatement') {
                pushDebugStatement(newStmts, each.loc.start.line, each.loc.end.line, newStmts.length - 1);
                jsCRiPS.popCallStack(newStmts, newStmts.length - 1);
            } else if (each.type === 'ExpressionStatement' && each.expression.type === 'AssignmentExpression' &&
                each.expression.right.type !== 'CallExpression') {
                pushDebugStatement(newStmts, each.expression.loc.start.line, each.expression.loc.end.line, newStmts.length - 1);
                jsCRiPS.updateVariable(newStmts, each.expression.left.name);
            } else if (each.type === 'ExpressionStatement' && each.expression.type === 'UpdateExpression') {
                pushDebugStatement(newStmts, each.expression.loc.start.line, each.expression.loc.end.line);
                jsCRiPS.updateVariable(newStmts, each.expression.argument.name);
            }

        }
        return newStmts;
    };
    ast.body = processStatements(ast.body);
    ast.body.push(debugVariablePrint);
    ast.body.push(esprima.parse('jsCRiPS.setHighlight(' + (ast.loc.end.line) + ',' + (ast.loc.end.line) + ');').body[0]);
    ast.body.push({
        "type": "ExpressionStatement",
        "expression": {
            "type": "CallExpression",
            "callee": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                    "type": "Identifier",
                    "name": "jsCRiPS"
                },
                "property": {
                    "type": "Identifier",
                    "name": "endRun"
                }
            },
            "arguments": []
        }
    }); // esprima.parse('jsCRiPS.endRun();').body[0]
    return escodegen.generate(ast);
};

// 開始時に例外が出ないために予めスレッドを生成しておく、例外を無視する仕様にした場合いらなくなるかも
// メインスレッド
jsCRiPS.mth = Concurrent.Thread.create(function () {
    Thread.stop();
});
// スレッド制御用
jsCRiPS.th = Concurrent.Thread.create(function () {
    Thread.stop();
});
jsCRiPS.ttls = []; // タートルを管理するリスト
jsCRiPS.imgs = {}; // 画像を管理するマップ
jsCRiPS.imgLoaded = false; // 画像読み込み制御
jsCRiPS.inputText = ''; // 入力されたテキスト
jsCRiPS.inputted = false; // 入力制御用

jsCRiPS.debugReady = false; // デバッグ制御用
jsCRiPS.callStack = [];     // デバッグ用コールスタック
jsCRiPS.functionNames = [];

/*global Map*/
jsCRiPS.parentChecker = new Map(); // ListTurtleでparentCheckを行うための親子管理マップ
jsCRiPS.audios = [];

/*global Concurrent*/
var Thread = Concurrent.Thread;
jsCRiPS.DEFAULT_SLEEP_TIME = 20;
jsCRiPS.sleepTime = jsCRiPS.DEFAULT_SLEEP_TIME;
jsCRiPS.stepKinds = [100000, 100000, 1000, 20, 5, 2];
jsCRiPS.moveStep = jsCRiPS.stepKinds[4];
jsCRiPS.rotateStep = jsCRiPS.stepKinds[4];
jsCRiPS.AutoSpeed = 0;
jsCRiPS.withKame = true;
jsCRiPS.withDebug = true;

jsCRiPS.DEFAULT_FONT = 'MS Gothic';
jsCRiPS.FONT_SIZE = 16;

jsCRiPS.LIST_MARGIN = 12;
jsCRiPS.CARD_MARGIN = 5;
jsCRiPS.INPUT_MARGIN = 2;
jsCRiPS.BUTTON_MARGIN = 5;

// for debugger
jsCRiPS.breakPoints = [];

// jsCRiPS Components
jsCRiPS.console = [];
jsCRiPS.localVariableTable = [];
jsCRiPS.globalVariableTable = [];
jsCRiPS.canvas = [];
jsCRiPS.tCanvas = [];   // Turtle描画用Canvas
jsCRiPS.lCanvas = [];   // 軌跡描画用Canvas
jsCRiPS.runButton = [];
jsCRiPS.stepButton = [];
jsCRiPS.reloadButton = [];
jsCRiPS.turtleSpeedChanger = [];
jsCRiPS.programSpeedChanger = [];

function createTurtle() {
    var t = {};

    t.x = 100.0; // (x,y)は対象の中心を示す
    t.y = 100.0;

    t.rx = t.x; // (x,y)から(rx,ry)まで線を引く
    t.ry = t.y;

    t.angle = -90;

    t._isShow = true;

    t.penDown = true;
    t.penColor = 'black';
    t._fontsize = jsCRiPS.FONT_SIZE;

    t.kameType = 0;
    t.kameColor = 'green';

    t._looks = null;
    t.str = null;

    t.kameScale = 0.4;
    t.width = 30;
    t.height = 50;

    // 基本的な命令
    t.rt = function (deg) {
        if (deg < 0) {
            t.lt(-deg);
        } else {
            jsCRiPS.th = Thread.create(function (deg, t) {
                var tmpAngle = t.angle;
                var tmpPendown = t.penDown;
                t.up();
                for (var i = jsCRiPS.rotateStep; i < deg; i += jsCRiPS.rotateStep) {
                    jsCRiPS.draw(t);
                    t.angle += jsCRiPS.rotateStep;
                    Thread.sleep(jsCRiPS.sleepTime);
                }
                t.angle = tmpAngle + deg;
                jsCRiPS.draw(t);
                t.penDown = tmpPendown;
            }, deg, t);
        }
    };

    t.lt = function (deg) {
        if (deg < 0) {
            t.rt(-deg);
        } else {
            jsCRiPS.th = Thread.create(function (deg, t) {
                var tmpAngle = t.angle;
                var tmpPendown = t.penDown;
                t.up();
                for (var i = jsCRiPS.rotateStep; i < deg; i += jsCRiPS.rotateStep) {
                    jsCRiPS.draw(t);
                    t.angle -= jsCRiPS.rotateStep;
                    Thread.sleep(jsCRiPS.sleepTime);
                }
                t.angle = tmpAngle - deg;
                jsCRiPS.draw(t);
                t.penDown = tmpPendown;
            }, deg, t);
        }
    };

    t.fd = function (d) {
        if (d < 0) {
            t.bk(-d);
        } else {
            jsCRiPS.th = Thread.create(function (d, t) {
                var xx = t.x,
                    yy = t.y;
                var dx = Math.cos(deg2rad(t.angle));
                var dy = Math.sin(deg2rad(t.angle));
                t.setRxRy();
                for (var i = jsCRiPS.moveStep; i < d; i += jsCRiPS.moveStep) {
                    t.x = xx + dx * i;
                    t.y = yy + dy * i;
                    jsCRiPS.draw(t);
                    t.setRxRy();
                    Thread.sleep(jsCRiPS.sleepTime);
                }
                t.x = xx + dx * d;
                t.y = yy + dy * d;
                jsCRiPS.draw(t);
            }, d, t);
        }
    };

    t.bk = function (d) {
        if (d < 0) {
            t.fd(-d);
        } else {
            jsCRiPS.th = Thread.create(function (d, t) {
                var xx = t.x,
                    yy = t.y;
                var dx = Math.cos(deg2rad(t.angle));
                var dy = Math.sin(deg2rad(t.angle));
                t.setRxRy();
                for (var i = jsCRiPS.moveStep; i < d; i += jsCRiPS.moveStep) {
                    t.x = xx - dx * i;
                    t.y = yy - dy * i;
                    jsCRiPS.draw(t);
                    t.setRxRy();
                    Thread.sleep(jsCRiPS.sleepTime);
                }
                t.x = xx - dx * d;
                t.y = yy - dy * d;
                jsCRiPS.draw(t);
            }, d, t);
        }
    };

    // TODO nokame時にupとdownなどがうまく動作しない問題あり(描画関係以外の命令が動かない？)
    t.up = function () {
        t.penDown = false;
    };

    t.down = function () {
        t.penDown = true;
    };

    t.color = function (c) {
        t.penColor = c;
    };


    // 座標に関する命令
    t.warp = function (x, y) {
        var tmpPendown = t.penDown;
        t.up();
        t.x = x;
        t.y = y;
        t.setRxRy();
        t.penDown = tmpPendown;
    };

    t.warpByTopLeft = function (x, y) {
        t.warp(x + t.getWidth() / 2, y + t.getHeight() / 2);
    };

    t.getX = function () {
        return t.x;
    };

    t.getY = function () {
        return t.y;
    };


    // 大きさに関する命令
    t.size = function (w, h) {
        t.setWidth(w);
        t.setHeight(h);
    };

    t.getWidth = function () {
        return t.width;
    };

    t.getHeight = function () {
        return t.height;
    };

    t.scale = function (n) {
        t.setWidth(t.width * n);
        t.setHeight(t.height * n);
    };

    t.large = function (n) {
        t.setWidth(t.width + n);
        t.setHeight(t.height + n);
    };

    t.small = function (n) {
        t.setWidth(t.width - n);
        t.setHeight(t.height - n);
    };

    t.wide = function (n) {
        t.setWidth(t.width + n);
    };

    t.narrow = function (n) {
        t.setWidth(t.width - n);
    };

    t.tall = function (n) {
        t.setHeight(t.height + n);
    };

    t.little = function (n) {
        t.setHeight(t.height - n);
    };

    t.setWidth = function (w) {
        if (w < 0) {
            t.width = 0;
        } else {
            t.width = w;
        }
    };

    t.setHeight = function (h) {
        if (h < 0) {
            t.height = 0;
        } else {
            t.height = h;
        }
    };


    // オブジェクトを出現/隠す命令
    t.show = function (b) {
        if (jsCRiPS.isUndefined(b)) {
            t._isShow = true;
        } else if (typeof b === 'boolean') {
            t._isShow = b;
        } else {
            println('引数の型が間違っています');
        }
    };

    t.hide = function () {
        t._isShow = false;
    };

    t.isShow = function () {
        return t._isShow;
    };

    // オブジェクトの見た目を変える命令
    // 現状ListTurtleには非対応
    t.looks = function (tt) {
        if (jsCRiPS.isDefined(tt._looks)) {  // tt extends Turtle
            t._looks = tt._looks;
            t.str = tt.str;
            t._fontsize = tt._fontsize;
            t.penColor = tt.penColor;
            t.width = tt.width;
            t.height = tt.height;
            t.angle = tt.angle;
            t.draw = tt.draw;
        } else {
            println('looks対象が間違っています[' + tt + ']');
        }
    };


    // オブジェクトの接触に関する命令
    // 参考：http://mclass13.web.fc2.com/hsplecture/nanamekukei.htm
    //  isPointInPath()を使う方法も考えられる
    t.contains = function (tx, ty) {
        var xx = t.x - t.width / 2, yy = t.y - t.height / 2;
        var cx = t.x,
            cy = t.y;
        var l = Math.sqrt((tx - cx) * (tx - cx) + (ty - cy) * (ty - cy));
        var r2 = Math.atan((ty - cy) / (tx - cx)) - deg2rad(t.angle);
        var tx2 = l * Math.cos(r2) + cx;
        var ty2 = l * Math.sin(r2) + cy;
        return xx <= tx2 && tx2 <= xx + t.width &&
            yy <= ty2 && ty2 <= yy + t.height;
    };

    // 参考：https://github.com/wise9/enchant.js/blob/5a9fea6c1e702c4e198fe856b7fb1a9db3418395/dev/src/Entity.js#L392
    // Copyright (c) Ubiquitous Entertainment Inc.
    t.intersects = function (trg) {
        var rad = deg2rad(t.angle);
        var rect1 = {}, rect2 = {};
        var x0 = -t.width / 2, y0 = -t.height / 2,  // 7    矩形の頂点の位置の対応
            x1 = t.width / 2, y1 = -t.height / 2,   // 9    7 8 9
            x2 = -t.width / 2, y2 = t.height / 2,   // 1    4 5 6
            x3 = t.width / 2, y3 = t.height / 2;    // 3    1 2 3
        rect1.leftTop = [t.x + x0 * Math.cos(rad) - y0 * Math.sin(rad), t.y + x0 * Math.sin(rad) + y0 * Math.cos(rad)];
        rect1.rightTop = [t.x + x1 * Math.cos(rad) - y1 * Math.sin(rad), t.y + x1 * Math.sin(rad) + y1 * Math.cos(rad)];
        rect1.leftBottom = [t.x + x2 * Math.cos(rad) - y2 * Math.sin(rad), t.y + x2 * Math.sin(rad) + y2 * Math.cos(rad)];
        rect1.rightBottom = [t.x + x3 * Math.cos(rad) - y3 * Math.sin(rad), t.y + x3 * Math.sin(rad) + y3 * Math.cos(rad)];

        rad = deg2rad(trg.angle);
        var xx0 = -trg.width / 2, yy0 = -trg.height / 2,    // 7
            xx1 = trg.width / 2, yy1 = -trg.height / 2,     // 9
            xx2 = -trg.width / 2, yy2 = trg.height / 2,     // 1
            xx3 = trg.width / 2, yy3 = trg.height / 2;      // 3
        rect2.leftTop = [trg.x + xx0 * Math.cos(rad) - yy0 * Math.sin(rad), trg.y + xx0 * Math.sin(rad) + yy0 * Math.cos(rad)];
        rect2.rightTop = [trg.x + xx1 * Math.cos(rad) - yy1 * Math.sin(rad), trg.y + xx1 * Math.sin(rad) + yy1 * Math.cos(rad)];
        rect2.leftBottom = [trg.x + xx2 * Math.cos(rad) - yy2 * Math.sin(rad), trg.y + xx2 * Math.sin(rad) + yy2 * Math.cos(rad)];
        rect2.rightBottom = [trg.x + xx3 * Math.cos(rad) - yy3 * Math.sin(rad), trg.y + xx3 * Math.sin(rad) + yy3 * Math.cos(rad)];

        var lt1 = rect1.leftTop, rt1 = rect1.rightTop,
            lb1 = rect1.leftBottom, rb1 = rect1.rightBottom,
            lt2 = rect2.leftTop, rt2 = rect2.rightTop,
            lb2 = rect2.leftBottom, rb2 = rect2.rightBottom,
            ltx1 = lt1[0], lty1 = lt1[1], rtx1 = rt1[0], rty1 = rt1[1],
            lbx1 = lb1[0], lby1 = lb1[1], rbx1 = rb1[0], rby1 = rb1[1],
            ltx2 = lt2[0], lty2 = lt2[1], rtx2 = rt2[0], rty2 = rt2[1],
            lbx2 = lb2[0], lby2 = lb2[1], rbx2 = rb2[0], rby2 = rb2[1],
            t1 = [rtx1 - ltx1, rty1 - lty1],
            r1 = [rbx1 - rtx1, rby1 - rty1],
            b1 = [lbx1 - rbx1, lby1 - rby1],
            l1 = [ltx1 - lbx1, lty1 - lby1],
            t2 = [rtx2 - ltx2, rty2 - lty2],
            r2 = [rbx2 - rtx2, rby2 - rty2],
            b2 = [lbx2 - rbx2, lby2 - rby2],
            l2 = [ltx2 - lbx2, lty2 - lby2],
        /*jslint bitwise: true */
            cx1 = (ltx1 + rtx1 + lbx1 + rbx1) >> 2,
            cy1 = (lty1 + rty1 + lby1 + rby1) >> 2,
            cx2 = (ltx2 + rtx2 + lbx2 + rbx2) >> 2,
            cy2 = (lty2 + rty2 + lby2 + rby2) >> 2,
            i, j, poss1, poss2, dirs1, dirs2, pos1, pos2, dir1, dir2,
            px1, py1, px2, py2, dx1, dy1, dx2, dy2, vx, vy, c, c1, c2;
        if (t1[0] * (cy2 - lty1) - t1[1] * (cx2 - ltx1) > 0 &&
            r1[0] * (cy2 - rty1) - r1[1] * (cx2 - rtx1) > 0 &&
            b1[0] * (cy2 - rby1) - b1[1] * (cx2 - rbx1) > 0 &&
            l1[0] * (cy2 - lby1) - l1[1] * (cx2 - lbx1) > 0) {
            return true;
        } else if (t2[0] * (cy1 - lty2) - t2[1] * (cx1 - ltx2) > 0 &&
            r2[0] * (cy1 - rty2) - r2[1] * (cx1 - rtx2) > 0 &&
            b2[0] * (cy1 - rby2) - b2[1] * (cx1 - rbx2) > 0 &&
            l2[0] * (cy1 - lby2) - l2[1] * (cx1 - lbx2) > 0) {
            return true;
        } else {
            poss1 = [lt1, rt1, rb1, lb1];
            poss2 = [lt2, rt2, rb2, lb2];
            dirs1 = [t1, r1, b1, l1];
            dirs2 = [t2, r2, b2, l2];
            for (i = 0; i < 4; i++) {
                pos1 = poss1[i];
                px1 = pos1[0];
                py1 = pos1[1];
                dir1 = dirs1[i];
                dx1 = dir1[0];
                dy1 = dir1[1];
                for (j = 0; j < 4; j++) {
                    pos2 = poss2[j];
                    px2 = pos2[0];
                    py2 = pos2[1];
                    dir2 = dirs2[j];
                    dx2 = dir2[0];
                    dy2 = dir2[1];
                    c = dx1 * dy2 - dy1 * dx2;
                    if (c !== 0) {
                        vx = px2 - px1;
                        vy = py2 - py1;
                        c1 = (vx * dy1 - vy * dx1) / c;
                        c2 = (vx * dy2 - vy * dx2) / c;
                        if (0 < c1 && c1 < 1 && 0 < c2 && c2 < 1) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    };

    // 補助
    t.setRxRy = function () {
        t.rx = t.x;
        t.ry = t.y;
    };

    t.printState = function () {
        println(
            '(x,y) = (' + parseInt(t.x) + ',' + parseInt(t.y) + ')\n' +
            'angle = ' + t.angle + '\n' +
            '(width,height) = (' + t.width + ',' + t.height + ')'
        );
    };

    t.strState = function () {
        return '(x,y) = (' + parseInt(t.x) + ',' + parseInt(t.y) + ') / ' +
            'angle = ' + t.angle + ' / ' +
            '(width,height) = (' + t.width + ',' + t.height + ')';
    };

    //　描画関係
    t.draw = function (ctx) {
        var self = this;
        var data = jsCRiPS.kameMotions[getMotion()];
        var dx = Math.cos(deg2rad(self.angle)), dy = Math.sin(deg2rad(self.angle));
        var ix = self.x, iy = self.y;
        ctx.strokeStyle = t.kameColor;
        for (var i = 0; i < data.length; i++) {
            var px = 0, py = 0;
            for (var j = 0; j < data[i].length; j += 2) {
                var kx = data[i][j], ky = data[i][j + 1];
                var nx = (kx * (-dy) + ky * (-dx)) * t.kameScale;
                var ny = (kx * dx + ky * (-dy)) * t.kameScale;
                if (j > 0) {
                    jsCRiPS.drawLine(ctx, ix + px, iy + py, ix + nx, iy + ny);
                }
                px = nx;
                py = ny;
            }
        }
        // (int)n / 2 % 4 => 0->0 , 1->1 , 2->0 , 3->2
        function getMotion() {
            var tmp = parseInt(t.kameType / 2) % 4;
            return parseInt(tmp % 2 + tmp / 3);
        }
    };

    jsCRiPS.ttls.push(t);
    return t;
}

// アニメーションを必要としないタートルの親
function createObjectTurtle() {
    var t = createTurtle();

    t.isObject = true;

    // override系 アニメーションなし
    t.fd = function (d) {
        if (d < 0) {
            t.bk(-d);
        } else {
            jsCRiPS.th = Thread.create(function (d, t) {
                var xx = t.x,
                    yy = t.y;
                var dx = Math.cos(deg2rad(t.angle));
                var dy = Math.sin(deg2rad(t.angle));
                t.setRxRy();
                t.x = xx + dx * d;
                t.y = yy + dy * d;
            }, d, t);
        }
    };

    t.bk = function (d) {
        if (d < 0) {
            t.fd(-d);
        } else {
            jsCRiPS.th = Thread.create(function (d, t) {
                var xx = t.x,
                    yy = t.y;
                var dx = Math.cos(deg2rad(t.angle));
                var dy = Math.sin(deg2rad(t.angle));
                t.setRxRy();
                t.x = xx - dx * d;
                t.y = yy - dy * d;
            }, d, t);
        }
    };

    t.rt = function (deg) {
        if (deg < 0) {
            t.lt(-deg);
        } else {
            jsCRiPS.th = Thread.create(function (deg, t) {
                var tmpAngle = t.angle;
                var tmpPendown = t.penDown;
                t.up();
                t.angle = tmpAngle + deg;
                t.penDown = tmpPendown;
            }, deg, t);
        }
    };

    t.lt = function (deg) {
        if (deg < 0) {
            t.rt(-deg);
        } else {
            jsCRiPS.th = Thread.create(function (deg, t) {
                var tmpAngle = t.angle;
                var tmpPendown = t.penDown;
                t.up();
                t.angle = tmpAngle - deg;
                t.penDown = tmpPendown;
            }, deg, t);
        }
    };

    // 描画関係
    t.drawObject = function (ctx, self, f) {
        t.drawScalableObject(ctx, self, 1, 1, f);
    };

    t.drawScalableObject = function (ctx, self, xr, yr, f) {
        ctx.save();
        ctx.translate(self.x, self.y);
        ctx.rotate(deg2rad(self.angle));
        ctx.scale(xr, yr);
        ctx.translate(-self.x, -self.y);
        f();
        ctx.restore();
    };

    t.penDown = false;
    t.angle = 0;
    t.width = 0;
    return t;
}

function createImageTurtle(imgName) {
    var t = createObjectTurtle();
    if (!jsCRiPS.imgs[imgName]) {
        // 画像読み込み待ち用にスレッドを生成、同期式で読み込むため多少遅い
        jsCRiPS.th = Thread.create(function () {
            while (!jsCRiPS.imgLoaded) {
                Thread.sleep(1);
            }
            jsCRiPS.imgLoaded = false;
        });
        var img = new Image();
        img.src = imgName;
        img.onload = function () {
            jsCRiPS.imgLoaded = true;
            jsCRiPS.imgs[imgName] = img;
            t._looks = jsCRiPS.imgs[imgName];
            t.width = t._looks.width;
            t.height = t._looks.height;
        };
        img.onerror = function () {
            jsCRiPS.imgLoaded = true;   // 例外投げたほうがいい？
            println('画像[' + imgName + ']が見つかりません');
        };
    } else {
        t._looks = jsCRiPS.imgs[imgName];
        t.width = t._looks.width;
        t.height = t._looks.height;
    }

    // override
    t.draw = function (ctx) {
        var self = this;
        t.drawObject(ctx, self, function () {
            ctx.drawImage(self._looks, self.x - self.width / 2, self.y - self.height / 2, self.width, self.height);
        });
    };

    return t;
}

function createTextTurtle(str) {
    var t = createObjectTurtle();
    t.str = str;
    // テキストの中身を変える命令
    t.text = function (newStr) {
        if (jsCRiPS.isUndefined(newStr)) {
            return t.str;
        }
        t.str = newStr;
        t.resize();
    };

    // TurtleCafeのマニュアルにはないがCRiPSで実装されていた関数、どうせCardTurtleで使う
    t.fontsize = function (fs) {
        if (jsCRiPS.isUndefined(fs)) {
            return t._fontsize;
        }
        t._fontsize = fs;
        t.resize();
    };

    t.getNumber = function () {
        return isInteger(str) ? -1 : Number(t.str);
    };

    t.getText = function () {
        return t.str;
    };

    // 描画関係
    t.resize = function () {
        var cx = t.x - t.width / 2;
        var ctx;
        for (var i = 0; i < jsCRiPS.tCanvas.length; i++) {
            ctx = jsCRiPS.tCanvas[i].getContext('2d');
            ctx.font = t._fontsize + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
        }
        t.width = ctx.measureText(str).width;
        t.height = t._fontsize;
        t.x = cx + t.width / 2;
    };

    t.resize();

    // override
    t.draw = function (ctx) {
        var self = this;
        ctx.font = t._fontsize + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillStyle = self.penColor;
        var defaultWidth = ctx.measureText(str).width;
        var defaultHeight = self._fontsize;
        t.drawScalableObject(ctx, self, self.width / defaultWidth, self.height / defaultHeight, function () {
            ctx.fillText(self.str, self.x, self.y);
        });
    };

    return t;
}

// parentCheckしている。参照の仕組みを理解させるか、直感的で自然な現象として理解させるかの教育上の都合？
function createListTurtle(autoHide, name) {
    var t = createObjectTurtle();
    t.name = name;

    t.list = [];
    t.cursor = 0;
    t.bgColor = 'white';

    t.actualWidth = 0;
    t.actualHeight = 0;
    t.width = t.height = 0; // ListTurtleではwidthとheightを追加幅として扱う

    t.nameWidth = 0;
    if (jsCRiPS.isDefined(name)) {
        var ctx;
        for (var i = 0; i < jsCRiPS.tCanvas.length; i++) {
            ctx = jsCRiPS.tCanvas[i].getContext('2d');
            ctx.font = jsCRiPS.FONT_SIZE + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
        }
        t.nameWidth = ctx.measureText(t.name).width;
    }

    // override系
    t.getWidth = function () {
        t.resize();
        return t.width + t.actualWidth;
    };

    t.getHeight = function () {
        t.resize();
        return t.height + t.actualHeight;
    };

    t.scale = function (n) {
        t.resize();
        t.width = t.actualWidth * n - t.actualWidth;
        t.height = t.actualHeight * n - t.actualHeight;
    };

    // 別のリストに要素が移ったら元のリストから要素を消す作業
    // CRiPSでは各Turtleにparentを設定していたが、TurtleをListTurtleの実装に依存させないことを意識してマップで管理してみた
    function parentCheck(x) {
        var p = jsCRiPS.parentChecker.get(x);   // 親を取り出す
        if (p) {  // 親がいるなら要素を削除
            p.remove(x);
        }
        jsCRiPS.parentChecker.set(x, t);   // 子に親をセット
    }

    // 追加と削除
    t.add = function (x, obj) { // x,objが両方Turtleをとり得るので注意
        if (jsCRiPS.isDefined(obj)) { // add(idx,obj)の場合
            parentCheck(obj);
            obj.show(!autoHide);
            if (x < 0 || t.list.length < x) {
                println('[ add(' + x + ',' + obj + ') ]挿入位置が不適切なので末尾に追加しました。');
                t.list.push(obj);
            } else {
                t.list.splice(x, 0, obj);
            }
        } else {    // add(obj)の場合
            parentCheck(x);
            x.show(!autoHide);
            t.list.push(x);
        }
    };

    t.addLast = function (obj) {
        t.add(obj);
    };

    t.addFirst = function (obj) {
        obj.show(!autoHide);
        parentCheck(obj);
        t.list.unshift(obj);
    };

    t.addAll = function (that) {
        for (var i = that.list.length; 0 < i; i--) {
            that.list[0].show(!autoHide);
            t.add(that.list[0]);
        }
    };

    t.moveAllTo = function (that) {
        that.addAll(t);
    };

    t.remove = function (x) {
        var trgIdx = -1;
        if (typeof x === 'number') {  // xがIndexの場合
            trgIdx = x;
        } else {  // xがオブジェクトだと思われる場合
            for (var i = 0; i < t.list.length; i++) {
                if (x === t.list[i]) {
                    trgIdx = i;
                }
            }
            if (trgIdx === -1) {
                println('remove対象が存在しません。');
                return null;
            }
        }
        var elem = t.list.splice(trgIdx, 1)[0];
        jsCRiPS.parentChecker.delete(elem);
        return elem;
    };

    t.removeFirst = function () {
        var elem = t.list.shift();
        jsCRiPS.parentChecker.delete(elem);
        return elem;
    };

    t.removeLast = function () {
        var elem = t.list.pop();
        jsCRiPS.parentChecker.delete(elem);
        return elem;
    };

    t.removeAll = function () {
        for (var i = 0; i < t.list.length; i++) {
            jsCRiPS.parentChecker.delete(t.list[i]);
        }
        t.list.length = 0;
    };


    // 取得関係
    t.get = function (idx) {
        return t.list[idx];
    };

    t.getSize = function () {
        return t.list.length;
    };


    // カーソル関係
    t.getCursor = function () {
        return t.cursor;
    };

    t.setCursor = function (newCursor) {
        if (newCursor < 0) {
            t.cursor = 0;
        } else if (newCursor <= t.list.length) {
            t.cursor = newCursor % t.list.length;
        } else {
            t.cursor = newCursor;
        }
    };

    t.moveCursorToNext = function () {
        if (t.list.length === 0) {
            t.cursor = 0;
        } else {
            t.cursor = (t.cursor + 1) % t.list.length;
        }
    };

    t.moveCursorToPrevious = function () {
        if (t.list.length === 0) {
            t.cursor = 0;
        } else {
            t.cursor = (t.cursor === 0) ? t.list.length - 1 : t.cursor - 1;
        }
    };

    t.getObjectAtCursor = function () {
        return t.list[t.cursor];
    };

    t.addToCursor = function (obj) {
        t.add(t.cursor, obj);
    };

    t.addToBeforeCursor = function (obj) {
        t.addToCursor(obj);
    };

    t.addToAfterCursor = function (obj) {
        t.add(t.cursor + 1, obj);
    };

    t.removeAtCursor = function () {
        return t.remove(t.cursor);
    };

    // 型がないし、そもそもいらない？
    t.getNumberAtCursor = function () {
        return t.getObjectAtCursor();
    };

    // 型がないし、そもそもいらない？
    t.getStringAtCursor = function () {
        return t.getObjectAtCursor();
    };


    // その他の命令
    // アルゴリズム：http://qiita.com/minodisk/items/94b6287468d0e165f6d9,https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    t.shuffle = function () {
        var i, j, temp;
        var arr = t.list.slice();
        i = arr.length;
        if (i === 0) {
            return arr;
        }
        while (--i) {
            j = Math.floor(Math.random() * (i + 1));
            temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        t.list = arr;
    };

    t.setBgColor = function (color) {
        t.bgColor = color;
    };

    // 内部で呼ばれる描画関係
    t.resize = function () {
        var cx = t.x - (t.width + t.actualWidth) / 2;
        var width = jsCRiPS.LIST_MARGIN;
        var maxHeight = 0;
        if (t.list.length !== 0) {
            for (var i = 0; i < t.list.length; i++) {
                var obj = t.list[i];
                width += obj.width + jsCRiPS.LIST_MARGIN;
                maxHeight = (maxHeight < obj.height) ? obj.height : maxHeight;
            }
            t.actualWidth = width;
            t.actualHeight = maxHeight + jsCRiPS.LIST_MARGIN * 2;
        } else {
            t.actualWidth = 60;
            t.actualHeight = 30;
        }
        if (jsCRiPS.isDefined(name)) {
            if ((t.nameWidth + jsCRiPS.LIST_MARGIN * 2) > t.actualWidth) {
                t.actualWidth = t.nameWidth + jsCRiPS.LIST_MARGIN * 2;
            }
            t.actualHeight += jsCRiPS.FONT_SIZE + jsCRiPS.LIST_MARGIN;
        }
        t.x = cx + (t.width + t.actualWidth) / 2;
    };

    // override
    t.draw = function (ctx) {
        t.resize();
        var x = t.x - t.actualWidth / 2, y = t.y - t.actualHeight / 2;
        var wr = t.getWidth() / t.actualWidth, hr = t.getHeight() / t.actualHeight;
        // 背景色と外枠
        t.drawScalableObject(ctx, t, wr, hr, function () {
            ctx.fillStyle = t.bgColor;
            ctx.fillRect(x, y, t.actualWidth, t.actualHeight);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';
            ctx.strokeRect(x, y, t.actualWidth, t.actualHeight);
        });
        x += jsCRiPS.LIST_MARGIN;
        y += jsCRiPS.LIST_MARGIN;
        // ListTurtleの名前
        if (jsCRiPS.isDefined(t.name)) {
            ctx.font = jsCRiPS.FONT_SIZE + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'black';
            t.drawScalableObject(ctx, t, wr, hr, function () {
                ctx.fillText(t.name, x + ctx.measureText(t.name).width / 2, y);
            });
            y += jsCRiPS.FONT_SIZE + jsCRiPS.LIST_MARGIN;
        }

        // 各要素
        for (var i = 0; i < t.list.length; i++) {
            var obj = t.list[i];
            var tx = obj.getX(), ty = obj.getY(), tangle = obj.angle;
            var trx = obj.rx, tryy = obj.ry;
            obj.warp(x + obj.width / 2, y + obj.height / 2);
            if (obj.isObject) {
                obj.angle = 0;
            }
            drawListElem(ctx, t, obj);
            obj.warp(tx, ty);
            obj.rx = trx;
            obj.ry = tryy;
            obj.angle = tangle;
            if (t.cursor === i) { // cursorのあたっている要素の場合赤い枠で囲む
                drawCursorRect(x, y, t.angle);
            }
            x += jsCRiPS.LIST_MARGIN + obj.width;
        }

        function drawListElem(ctx, t, obj) {
            t.drawScalableObject(ctx, t, wr, hr, function () {
                obj.draw(ctx);
            });
        }

        function drawCursorRect(x, y) {
            t.drawScalableObject(ctx, t, wr, hr, function () {
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'red';
                ctx.strokeRect(x, y, obj.width, obj.height);
            });
        }
    };

    return t;
}

function createCardTurtle(str) {
    var t = createTextTurtle(str);   // CRiPSではImageTurtleを継承していたがTextTurtleに変更
    t.margin2 = jsCRiPS.CARD_MARGIN * 2;

    // 描画関係
    // override
    t.resize = function () {
        var cx = t.x - t.width / 2;
        var ctx;
        for (var i = 0; i < jsCRiPS.tCanvas.length; i++) {
            ctx = jsCRiPS.tCanvas[i].getContext('2d');
            ctx.font = jsCRiPS.FONT_SIZE + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
        }
        t.width = ctx.measureText(t.str).width + t.margin2;
        t.height = t._fontsize + t.margin2;
        t.x = cx + t.width / 2;
    };

    t.resize();

    // override
    t.draw = function (ctx) {
        var self = this;
        ctx.font = t._fontsize + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = self.penColor;
        ctx.strokeStyle = self.penColor;
        var defaultWidth = ctx.measureText(t.str).width + t.margin2;
        var defaultHeight = self._fontsize + t.margin2;
        t.drawScalableObject(ctx, self, self.width / defaultWidth, self.height / defaultHeight, function () {
            ctx.fillText(self.str, self.x, self.y);
        });
        t.drawObject(ctx, self, function () {
            ctx.strokeRect(self.x - self.width / 2, self.y - self.height / 2, self.width, self.height);
        });
    };

    return t;
}

function createInputTurtle() {
    var t = createCardTurtle('');
    t.margin2 = jsCRiPS.INPUT_MARGIN * 2;
    var JapaneseMode = false;

    t.resize();

    t.inputCapturing = true;

    t.setActive = function (active) {
        t.inputCapturing = active;
    };

    t.isActive = function () {
        return t.inputCapturing;
    };

    t.clearText = function () {
        t.str = '';
        t.resize();
    };

    t.toJapaneseMode = function () {
        JapaneseMode = true;
    };

    t.toEnglishMode = function () {
        JapaneseMode = false;
    };

    // 内部で使うテキストを変更するもの
    t.captureText = function (e) {
        if (!t.inputCapturing) {
            return;
        }
        var newStr = t.str;
        if (e.keyCode === 8) {   // backspace
            newStr = t.str.slice(0, -1);
        } else {
            newStr += String.fromCharCode(Number(e.charCode));
            if (JapaneseMode) {
                newStr = romanConvert(newStr);
            }
        }

        t.str = newStr;

        t.resize();

        function romanConvert() {
            for (var i = 0; i < romanTable.length; i++) {
                var key = romanTable[i].key;
                var index = newStr.indexOf(key);
                if (index !== -1) {
                    return newStr.substring(0, index) + romanTable[i].val;
                }
            }
            return newStr;
        }
    };

    return t;
}

function createButtonTurtle(str) {
    var t = createCardTurtle(str);
    t.margin2 = jsCRiPS.BUTTON_MARGIN * 2;
    var clicked = false;    // マウスが[範囲内]で[押されている]状態からぬけ出すとクリックとみなす
    t.pressing = false;

    t.resize();

    t.isClicked = function () {
        var ret = clicked;
        clicked = false;
        return ret;
    };

    // override
    t.draw = function (ctx) {
        var self = this;
        if (jsCRiPS.isDefined(self.pressing)) {  // ButtonTurtleの場合
            clickCheck();
        }
        ctx.font = t._fontsize + 'px \'' + jsCRiPS.DEFAULT_FONT + '\'';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.strokeStyle = self.penColor;
        ctx.fillStyle = self.pressing ? 'black' : 'white';  // CRiPSのButtonTurtle同様に色を連動させるなら self.pressing -> t.pressing
        var defaultWidth = ctx.measureText(t.str).width + t.margin2;
        var defaultHeight = self._fontsize + t.margin2;
        t.drawObject(ctx, self, function () {
            ctx.strokeRect(self.x - self.width / 2, self.y - self.height / 2, self.width, self.height);
            ctx.fillRect(self.x - self.width / 2, self.y - self.height / 2, self.width, self.height);
        });
        ctx.fillStyle = self.penColor;
        t.drawScalableObject(ctx, self, self.width / defaultWidth, self.height / defaultHeight, function () {
            ctx.fillText(self.str, self.x, self.y);
        });
    };

    function clickCheck() {
        var containAndPress = (mouseDown() && t.contains(mouseX(), mouseY()));
        clicked = t.pressing && !containAndPress;
        t.pressing = containAndPress;
    }

    return t;
}

function createSoundTurtle(path) {
    var t = createCardTurtle(path);
    t.x = -100;
    t.y = -100;

    /* global Audio */
    t.audio = new Audio(path);

    t.audio.onerror = function () {
        println('サウンド[' + path + ']が見つかりません');
    };

    t.play = function () {
        t.audio.loop = false;
        t.audio.play();
    };

    t.stop = function () {
        t.audio.pause();
        t.audio.currentTime = 0;
    };

    // stopだけだと分かりにくいので新たに追加
    t.pause = function () {
        t.audio.pause();
    };

    t.loop = function () {
        t.audio.loop = true;
        t.audio.play();
    };

    t.isPlaying = function () {
        return !t.audio.paused;
    };

    t.getVolume = function () {
        return t.audio.volume * 100;
    };

    t.setVolume = function (volume) {
        volume = volume < 0 ? 0 : volume;
        volume = volume > 100 ? 100 : volume;
        t.audio.volume = volume * 0.01;
    };

    t.loadOnMemory = function () {
        t.audio.load();
    };

    jsCRiPS.audios.add(t);

    return t;
}

// 現在使っていない、デフォルトタートル用のものたち
//var defaultTurtle = createTurtle();
//
//function fd(d) {
//    defaultTurtle.fd(d);
//}
//
//function bk(d) {
//    defaultTurtle.bk(d);
//}
//
//
//function rt(deg) {
//    defaultTurtle.rt(deg);
//}
//
//function lt(deg) {
//    defaultTurtle.lt(deg);
//}
//
//function up() {
//    defaultTurtle.up();
//}
//
//function down() {
//    defaultTurtle.down();
//}
//
//function color(c) {
//    defaultTurtle.color(c);
//}


/* 描画関連 */
jsCRiPS.draw = function (t) {
    jsCRiPS.clearTurtleCanvas();
    if (t) {    // t == Turtle
        t.kameType++;
    }
    for (var i = 0; i < jsCRiPS.ttls.length; i++) {
        if (jsCRiPS.ttls[i]._isShow) {
            jsCRiPS.drawTurtle(jsCRiPS.ttls[i]);
        }
    }
    if (t && t.penDown) {
        jsCRiPS.drawLocus(t);
    }
};

jsCRiPS.drawTurtle = function (t) {
    for (var i = 0; i < jsCRiPS.tCanvas.length; i++) {
        t.draw(jsCRiPS.tCanvas[i].getContext('2d'));
    }
};

jsCRiPS.drawLine = function (ctx, x, y, dx, dy) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(dx, dy);
    ctx.closePath();
    ctx.stroke();
};

jsCRiPS.drawLocus = function (t) {
    for (var i = 0; i < jsCRiPS.lCanvas.length; i++) {
        var ctx = jsCRiPS.lCanvas[i].getContext('2d');
        ctx.strokeStyle = t.penColor;
        jsCRiPS.drawLine(ctx, t.rx, t.ry, t.x, t.y);
    }
};

jsCRiPS.clearTurtleCanvas = function () {
    jsCRiPS.clearCanvas(jsCRiPS.tCanvas);
};

jsCRiPS.clearLocusCanvas = function () {
    jsCRiPS.clearCanvas(jsCRiPS.lCanvas);
};

jsCRiPS.clearAllCanvas = function () {
    jsCRiPS.clearTurtleCanvas();
    jsCRiPS.clearLocusCanvas();
};

jsCRiPS.clearCanvas = function (canvas) {
    for (var i = 0; i < canvas.length; i++) {
        canvas[i].getContext('2d').clearRect(0, 0, canvas[i].width, canvas[i].height);
    }
};

/* 一般補助メソッド */
function deg2rad(deg) {
    return deg * Math.PI / 180;
}

function isInteger(str) {
    return (!Number.isNaN(Number(str)) || !Number.isNaN(parseInt(str, 10)));
}

// ユーザー用、秒単位で指定 sleepにするとなぜかConcurrent.Thread.jsのsleepが呼ばれてしまう
function jsleep(s) {
    jsCRiPS.th = Thread.create(function (s) {
        Thread.sleep(s * 1000);
    }, s);
}

function update() {
    jsCRiPS.draw();
}

function start(f) {
    jsCRiPS.mth = Thread.create(f);
}

function random(n) {
    return parseInt(Math.random() * n);
}

// CRiPS#window.size -> jsCRiPS#canvasSize
function canvasSize(w, h) {
    for (var i = 0; i < jsCRiPS.tCanvas.length; i++) {
        jsCRiPS.tCanvas[i].width = w;
        jsCRiPS.tCanvas[i].height = h;
        jsCRiPS.tCanvas[i].parentNode.style.width = w + 'px';
        jsCRiPS.tCanvas[i].parentNode.style.height = w + 'px';
    }
    for (var i = 0; i < jsCRiPS.lCanvas.length; i++) {
        jsCRiPS.lCanvas[i].width = w;
        jsCRiPS.lCanvas[i].height = h;
//        jsCRiPS.lCanvas[i].parentNode.style.width = w + 'px';
//        jsCRiPS.lCanvas[i].parentNode.style.height = w + 'px';
    }
}

jsCRiPS.initProgram = function () {
    try {
        jsCRiPS.mth.kill();
        jsCRiPS.th.kill();
    } catch (e) {
        println('ERROR [ ' + e + ' ]');
    }
    jsCRiPS.mth = Thread.create(function () {
    }); // これらが無いと最初のprint系でjoinし続ける？
    jsCRiPS.th = Thread.create(function () {
    });

    jsCRiPS.clearAllCanvas();
    jsCRiPS.clearConsole();

    jsCRiPS.parentChecker.clear();
    jsCRiPS.ttls = [];
    for (var i = 0; i < jsCRiPS.audios.length; i++) {
        jsCRiPS.audios[i].pause();
        jsCRiPS.audios[i].src = '';
    }
    jsCRiPS.audios = [];
};

jsCRiPS.endRun = function () {
    for (var i = 0; i < jsCRiPS.runButton.length; i++) {
        var rb = jsCRiPS.runButton[i];
        if (jsCRiPS.isDefined(rb.img)) {
            rb.img.src = rb.runButtonImg;
        }
        rb.classList.remove(rb.pauseButtonClassName);
        rb.classList.add(rb.runButtonClassName);
    }
    jsCRiPS.runReady = false;
};
jsCRiPS.runReady = false;

/* htmlから呼び出される、html側へ呼ぶ関数群、外部とのAPI */
/* TODO 行数が多いほど遅くなる傾向にある
 debugConverter.convertとThread.createに時間がかかっている
 convertが1にたいして、esprimaでのparseが1/3、実行コード生成が1/3、escodegenでの生成が1/3程度の割合 */
jsCRiPS.debugStart = function () {

    jsCRiPS.initProgram();

    jsCRiPS.debugReady = false;
    jsCRiPS.callStack = [];
    jsCRiPS.callStack[0] = makeCallStack('');
    jsCRiPS.functionNames = [];

    /* global debugMain */
    debugMain();

    jsCRiPS.autoStart(false);
    jsCRiPS.runReady = true;

};

jsCRiPS.debugNext = function () {
    if (!jsCRiPS.runReady) {
        jsCRiPS.debugStart();
    } else {
        jsCRiPS.debugReady = true;
        jsCRiPS.autoStart(false);
    }
};

jsCRiPS.debugRun = function () {
    if (!jsCRiPS.runReady) {
        jsCRiPS.debugStart();
        jsCRiPS.autoStart(true);
    } else {
        if (jsCRiPS.AutoMode) {
            jsCRiPS.autoStart(false);
        } else {
            jsCRiPS.autoStart(true);
        }
    }
};

jsCRiPS.autoStart = function (enable) {
    jsCRiPS.AutoMode = enable;
    for (var i = 0; i < jsCRiPS.runButton.length; i++) {
        var rb = jsCRiPS.runButton[i];
        if (enable) {
            if (jsCRiPS.isDefined(rb.img)) {
                rb.img.src = rb.pauseButtonImg;
            }
            rb.classList.remove(rb.runButtonClassName);
            rb.classList.add(rb.pauseButtonClassName);
        } else {
            if (jsCRiPS.isDefined(rb.img)) {
                rb.img.src = rb.runButtonImg;
            }
            rb.classList.add(rb.runButtonClassName);
            rb.classList.remove(rb.pauseButtonClassName);
        }

    }
};

// no kame時に前の描画部分が残ってしまう場合あり、example5.3.1.1_Circle.jsをno kameで実行し速度を変えて再度Runで発生
jsCRiPS.changeSpeed = function (x) {
    jsCRiPS.moveStep = jsCRiPS.stepKinds[Number(x)];
    jsCRiPS.rotateStep = jsCRiPS.stepKinds[Number(x)];

    jsCRiPS.withKame = Number(x) > 1; // if(withKame === true){ joinしない }
    jsCRiPS.withDebug = Number(x) !== 0; // if(withDebug === true){ debug表示をしない }
};

// x is sec
jsCRiPS.changeAutoSpeed = function (x) {
    jsCRiPS.AutoSpeed = (Number(x) * Number(x)) * 1000;
};

function setBreakPoint(row) {
    jsCRiPS.breakPoints.push(row);
}

function clearBreakPoint(row) {
    for (var i = 0; i < jsCRiPS.breakPoints.length; i++) {
        if (jsCRiPS.breakPoints[i] === row) {
            jsCRiPS.breakPoints.splice(i, 1);
        }
    }
}

function print() {
    var str = '';
    for (var i = 0; i < arguments.length - 1; i++) {
        str += arguments[i] + ',';
    }
    str += arguments[arguments.length - 1];

    for (var i = 0; i < jsCRiPS.console.length; i++) {
        var msgArea = jsCRiPS.console[i];
        msgArea.value += str;
        while (msgArea.value.length > msgArea.maxLength && msgArea.maxLength !== 0) {
            msgArea.value = msgArea.value.split('\n').slice(1).join('\n');
        }
        msgArea.scrollTop = msgArea.scrollHeight;
    }
}

function println() {
    var str = '';
    for (var i = 0; i < arguments.length - 1; i++) {
        str += arguments[i] + ',';
    }
    str += arguments[arguments.length - 1];
    print(str + '\n');
}

jsCRiPS.clearConsole = function () {
    for (var i = 0; i < jsCRiPS.console.length; i++) {
        jsCRiPS.console[i].value = '';
    }
};


// イベント関係
// リスナー登録より上で宣言する必要あり
jsCRiPS.keyDown = function (e) {
    jsCRiPS.keys[e.keyCode] = true;
    jsCRiPS.recentPressKey = e.keyCode;
    if (e.keyCode === 8) {  // BackSpace chromeではpressで検知できないため
        for (var i = 0; i < jsCRiPS.ttls.length; i++) {
            if (jsCRiPS.ttls[i].inputCapturing) {    // InputTurtle かつ active
                jsCRiPS.ttls[i].captureText(e);
            }
        }
    }

    // key bind
    // 必要に応じてeditor.htmlにも記述する必要あり
    if (e.ctrlKey && e.keyCode === 83) { // key = [S] (83)
        console.log('Ctrl+S!');
        jsCRiPS.editor.format();
        e.preventDefault();
        return false;
    }

    if (e.ctrlKey && e.shiftKey && e.keyCode === 70) { // key = [F] (70)
        jsCRiPS.editor.format();
        e.preventDefault();
        return false;
    }

};

jsCRiPS.keyPress = function (e) {
    if (e.keyCode !== 8 && e.keyCode !== 13) {  // BackSpaceとEnterを無視
        for (var i = 0; i < jsCRiPS.ttls.length; i++) {
            if (jsCRiPS.ttls[i].inputCapturing) {    // InputTurtle かつ active
                jsCRiPS.ttls[i].captureText(e);
            }
        }
    }
};

jsCRiPS.keyUp = function (e) {
    jsCRiPS.keys[e.keyCode] = false;
    if (jsCRiPS.recentPressKey === e.keyCode) {
        jsCRiPS.recentPressKey = -1;
    }
};

jsCRiPS.mouseMove = function (e) {
    var r = e.target.getBoundingClientRect();
    jsCRiPS.mx = e.clientX - r.left;
    jsCRiPS.my = e.clientY - r.top;
};

jsCRiPS.mouseDown = function (e) {
    jsCRiPS.mouseLeftDown = (jsCRiPS.mouseLeftDown || (e.button === jsCRiPS.MOUSE_LEFT));
    jsCRiPS.mouseRightDown = (jsCRiPS.mouseRightDown || (e.button === jsCRiPS.MOUSE_RIGHT));
};

jsCRiPS.mouseUp = function (e) {
    jsCRiPS.mouseLeftDown = (jsCRiPS.mouseLeftDown && (e.button !== jsCRiPS.MOUSE_LEFT));
    jsCRiPS.mouseRightDown = (jsCRiPS.mouseRightDown && (e.button !== jsCRiPS.MOUSE_RIGHT));
};

jsCRiPS.mouseClick = function (e) {
    jsCRiPS.leftClick = (jsCRiPS.leftClick || (e.button === jsCRiPS.MOUSE_LEFT));
    jsCRiPS.rightClick = (jsCRiPS.rightClick || (e.button === jsCRiPS.MOUSE_RIGHT));
};

jsCRiPS.mouseDoubleClick = function (e) {
    jsCRiPS.wclick = true;
};

jsCRiPS.keys = {};
jsCRiPS.recentPressKey = -1;
document.addEventListener('keydown', jsCRiPS.keyDown);
document.addEventListener('keypress', jsCRiPS.keyPress);
document.addEventListener('keyup', jsCRiPS.keyUp);

jsCRiPS.mx = -1;
jsCRiPS.my = -1;
jsCRiPS.MOUSE_LEFT = 0;
jsCRiPS.MOUSE_RIGHT = 2;
jsCRiPS.mouseLeftDown = false;
jsCRiPS.mouseRightDown = false;
jsCRiPS.leftClick = false;
jsCRiPS.rightClick = false;
jsCRiPS.wclick = false;
document.addEventListener('mousemove', jsCRiPS.mouseMove);
document.addEventListener('mousedown', jsCRiPS.mouseDown);
document.addEventListener('mouseup', jsCRiPS.mouseUp);
document.addEventListener('click', jsCRiPS.mouseClick);
document.addEventListener('dblclick', jsCRiPS.mouseDoubleClick);

// キー・マウス入力に関する命令
function key() {
    return jsCRiPS.recentPressKey;
}

function keyDown(keyCode) {
    return isPressing(keyCode);
}

function isPressing(keyCode) {
    return jsCRiPS.keys[keyCode] ? jsCRiPS.keys[keyCode] : false;
}

function mouseX() {
    return jsCRiPS.mx;
}

function mouseY() {
    return jsCRiPS.my;
}

function mouseClicked() {
    var ret = (jsCRiPS.leftClick || jsCRiPS.rightClick);
    jsCRiPS.leftClick = jsCRiPS.rightClick = false;
    return ret;
}

function leftMouseClicked() {
    var ret = jsCRiPS.leftClick;
    jsCRiPS.leftClick = false;
    return ret;
}

function rightMouseClicked() {
    var ret = jsCRiPS.rightClick;
    jsCRiPS.rightClick = false;
    return ret;
}

function doubleClick() {
    var ret = jsCRiPS.wclick;
    jsCRiPS.wclick = false;
    return ret;
}

function mouseDown() {
    return (jsCRiPS.mouseLeftDown || jsCRiPS.mouseRightDown);
}

function leftMouseDown() {
    return (mouseDown() && jsCRiPS.mouseLeftDown);
}

function rightMouseDown() {
    return (mouseDown() && jsCRiPS.mouseRightDown);
}


/* global swal*/
function input(msg) {
    jsCRiPS.th = Thread.create(function () {    //  入力待ち用にスレッドを生成
        while (!jsCRiPS.inputted) {
            Thread.sleep(1);
        }
        Thread.sleep(200); // Input用ウィンドウが消えるのを待つ
        jsCRiPS.inputted = false;
    });

    if (typeof swal === 'function') {
        swal({
                title: msg ? msg : 'An input!',
                type: 'input',
                allowEscapeKey: false,
                closeOnConfirm: false
            },
            function (inputValue) {
                if (inputValue === '') {
                    swal.showInputError('You need to write something!');
                    return false;
                }
                jsCRiPS.inputText = isInteger(inputValue) ?
                    Number(inputValue) : inputValue;

                println('INPUT [' + jsCRiPS.inputText + ']');
                jsCRiPS.inputted = true;             // th.kill(); 本当はこうしたい
                swal.close();
            }
        );
    } else {
        console.log('You can use sweet alert library');
        jsCRiPS.inputText = prompt(msg ? msg : 'An input!');
        jsCRiPS.inputText = isInteger(jsCRiPS.inputText) ?
            Number(jsCRiPS.inputText) : jsCRiPS.inputText;
        println('INPUT [' + jsCRiPS.inputText + ']');
        jsCRiPS.inputted = true;
    }

}

// create jsCRiPS object (like JQuery,$ method)
// HTML要素からjsCRiPSオブジェクトを作成する
function JCRiPS(selector) {
    var obj = {};
    obj.elems = [];
    addSelectedElems();

    //    *****       define Components      *****
    obj.console = function (userOpts) {
        var opts = {
            rows: 6,
            cols: 80,
            readonly: true,
            maxLength: 10000    // テキストエリア内の最大文字数、0の場合は制限なし
        };
        wrapElem('textarea');
        setComponentData(jsCRiPS.console, obj.elems, userOpts, opts);
    };

    obj.globalVariableTable = function (userOpts) {
        wrapElem('table');
        makeVariableTable(jsCRiPS.globalVariableTable, userOpts);
    };

    obj.localVariableTable = function (userOpts) {
        wrapElem('table');
        makeVariableTable(jsCRiPS.localVariableTable, userOpts);
    };

    function makeVariableTable(tableKind, userOpts) {
        var tcn = (tableKind === jsCRiPS.globalVariableTable) ?
            'globalVariableTable' : 'localVariableTable';
        var opts = {
            position: 'absolute',
            draggable: true,
            scroll: true,
            tableClassName: tcn,
            thName: 'name',
            thValue: 'value',
            thType: 'type',
            thPos: 'position'
        };
        setComponentData(tableKind, obj.elems, userOpts, opts, function (elem) {
            if (elem.scroll) {
                elem.style['overflow-y'] = 'scroll';
            }
            if (elem.draggable && jsCRiPS.isDefined($)) {
                if (jsCRiPS.isDefined(elem.parent)) {
                    $(elem.parent).draggable();    // require JQuery UI
                } else {
                    $(elem).draggable();    // require JQuery UI
                }
            } else if (elem.draggable && jsCRiPS.isUndefined($)) {
                console.log('require JQuery UI');
            }
            setData(elem, tcn);
        });

        // HTML要素のTableを作る
        function setData(table, className) {
            table.setAttribute('class', className);
            table.setAttribute('width', '95%');
            table.setAttribute('border', '1');
            table.style.tableLayout = 'fixed';

            var newRow = table.insertRow(0);
            var thName = document.createElement('th');
            thName.innerHTML = table.thName;
            var thValue = document.createElement('th');
            thValue.innerHTML = table.thValue;
            var thType = document.createElement('th');
            thType.innerHTML = table.thType;
            var thPos = document.createElement('th');
            thPos.innerHTML = table.thPos;
            newRow.appendChild(thName);
            newRow.appendChild(thValue);
            newRow.appendChild(thType);
            newRow.appendChild(thPos);
        }
    }

    obj.canvas = function (userOpts) {
        var opts = {
            draggable: false,
            width: 240,
            height: 240,
            locusCanvasClassName: 'locusCanvas',
            turtleCanvasClassName: 'turtleCanvas',
            deleteAntiAliasing: true
        };
        setComponentData(jsCRiPS.canvas, obj.elems, userOpts, opts, function (elem) {

            function setData(canvas) {
                canvas.width = elem.width;
                canvas.height = elem.height;
                canvas.style.position = 'absolute';
            }

            var lc = document.createElement('canvas');
            setData(lc);
            lc.className = elem.locusCanvasClassName;

            var tc = document.createElement('canvas');
            setData(tc);
            tc.className = elem.turtleCanvasClassName;

            // 余計なアンチエイリアスの解除
            if (elem.deleteAntiAliasing) {
                lc.getContext('2d').translate(0.5, 0.5);
            }

            jsCRiPS.lCanvas.push(lc);
            jsCRiPS.tCanvas.push(tc);
            elem.appendChild(lc);
            elem.appendChild(tc);

            if (elem.draggable && jsCRiPS.isDefined($)) {
                $(elem).draggable();    // require JQuery UI
            } else if (elem.draggable && jsCRiPS.isUndefined($)) {
                console.log('require JQuery UI');
            }
        });
    };

    obj.runButton = function (userOpts) {
        var opts = {
            createImage: false,
            runButtonImg: './img/run.png',
            pauseButtonImg: './img/pause.png',
            runButtonClassName: 'runButton',
            pauseButtonClassName: 'pauseButton'
        };
        setComponentData(jsCRiPS.runButton, obj.elems, userOpts, opts, function (elem) {
            elem.onclick = jsCRiPS.debugRun;
            if (elem.createImage) {
                var imgElem = document.createElement('img');
                imgElem.src = elem.runButtonImg;
                imgElem.alt = 'Run/Pause';
                elem.appendChild(imgElem);
                elem.img = imgElem;
            }
        });
    };

    // disable時の画像やopacity値などを変えたい場合は、属性セレクタを使えば可能
    obj.stepButton = function (userOpts) {
        var opts = {};
        setComponentData(jsCRiPS.stepButton, obj.elems, userOpts, opts, function (elem) {
            elem.onclick = jsCRiPS.debugNext;
        });
    };

    obj.reloadButton = function (userOpts) {
        var opts = {};
        setComponentData(jsCRiPS.reloadButton, obj.elems, userOpts, opts, function (elem) {
            elem.onclick = jsCRiPS.debugStart;
        });
    };

    obj.turtleSpeedChanger = function (userOpts) {
        var opts = {
            value: 4,
            noDebug: false
        };
        wrapElem('input', function (ne) {
            ne.type = 'range';
        });
        setComponentData(jsCRiPS.turtleSpeedChanger, obj.elems, userOpts, opts, function (elem) {
            elem.min = elem.noDebug ? 0 : 1;
            elem.max = 5;
            elem.step = 1;
            elem.setAttribute('onchange', 'jsCRiPS.changeSpeed(this.value)');
            elem.setAttribute('oninput', 'jsCRiPS.changeSpeed(this.value)');
            jsCRiPS.changeSpeed(elem.value);
        });
    };

    obj.programSpeedChanger = function (userOpts) {
        var opts = {
            value: 0
        };
        wrapElem('input', function (ne) {
            ne.type = 'range';
        });
        setComponentData(jsCRiPS.programSpeedChanger, obj.elems, userOpts, opts, function (elem) {
            elem.min = 0;
            elem.max = 1.414;
            elem.step = 0.1;
            elem.setAttribute('onchange', 'jsCRiPS.changeAutoSpeed(this.value)');
            elem.setAttribute('oninput', 'jsCRiPS.changeAutoSpeed(this.value)');
            jsCRiPS.changeAutoSpeed(elem.value);
        });
    };

    obj.editor = function (userOpts) {
        var opts = {
            id: 'editorFrame',
            src: 'editor.html',
            width: '400px',
            height: '480px',
            frameborder: 0,
            autoResize: false,
            autoFormat: false,
            resizeMaxLen: 200,
            formatOpts: {}
        };
        overwriteOptions(userOpts, opts);
        wrapElem('iframe', function (ne) {
            ne.setAttribute("frameborder", opts.frameborder);
            ne.width = opts.width;
            ne.height = opts.height;
        });
        setComponentData(jsCRiPS.console, obj.elems, userOpts, opts, function (elem) {
            jsCRiPS.editor = elem.contentWindow;
            elem.onload = function () {
                if (elem.autoResize) {
                    jsCRiPS.editor.autoResize(elem.resizeMaxLen);
                }
            };
        });
    };

    return obj;

    // ***** 以下便利メソッド *****
    // selectorで指定された要素をobj.elems配列に格納していく
    function addSelectedElems() {
        var selectors = selector.toString().split(',');
        for (var i = 0; i < selectors.length; i++) {
            var s = selectors[i];
            if (s.length === 0) {
                continue;
            }
            switch (s[0]) {
                case '.':   // class
                    pushElems(document.getElementsByClassName(s.substr(1)), s);
                    break;
                case '#':   // id
                    pushElems([document.getElementById(s.substr(1))], s);
                    break;
                default:    // HTML Elem
                    pushElems(document.getElementsByTagName(s), s);
            }
        }

        function pushElems(elems, trgElem) {
            if (elems.length === 0 || elems[0] === null) {
                console.log(`Missing selector [ ${trgElem} ]`);
            } else {
                for (var i = 0; i < elems.length; i++) {
                    obj.elems.push(elems[i]);
                }
            }
        }

    }

    // fromからdstへオブジェクトを上書きする
    function overwriteOptions(from, dst, createKeyMode) {
        if (jsCRiPS.isUndefined(from)) {
            return;
        }
        var fKeys = Object.keys(from);
        for (var i = 0, len = fKeys.length; i < len; i++) {
            if (jsCRiPS.isDefined(dst[fKeys[i]]) || createKeyMode) {
                dst[fKeys[i]] = from[fKeys[i]];
            }
        }
    }

    // elemsをComponentへ追加しつつオプションをセットする
    function setComponentData(component, elems, userOptions, defaultOptions, additionalFunc) {
        overwriteOptions(userOptions, defaultOptions);
        for (var i = 0; i < elems.length; i++) {
            component.push(elems[i]);
            overwriteOptions(defaultOptions, elems[i], true);
            if (jsCRiPS.isDefined(additionalFunc)) {
                additionalFunc(elems[i]);
            }
        }
    }

    // セレクターで指定された要素(a)の中に、引数で指定された新しい要素(b)を作成し、bをaとする。
    function wrapElem(elemName, elemOptsFunc) {
        var newElems = [];
        for (var i = 0; i < obj.elems.length; i++) {
            var ne = document.createElement(elemName);
            if (jsCRiPS.isDefined(elemOptsFunc)) {
                elemOptsFunc(ne);
            }
            obj.elems[i].appendChild(ne);
            ne.parent = obj.elems[i];
            newElems.push(ne);
        }
        obj.elems = newElems;
    }

}


// Utilities
jsCRiPS.isDefined = function (x) {
    return (typeof x !== 'undefined');
};
jsCRiPS.isUndefined = function (x) {
    return !jsCRiPS.isDefined(x);
};

// 亀描画用データ
jsCRiPS.kameMotions = [
    // Front
    [[-12, -6, -12, 6, 0, 18, 12, 6, 12, -6, 0, -18, -12, -6],
        [-18, -12, -12, -6],
        [-6, -24, 0, -18, 6, -24],
        [12, -6, 18, -12],
        [12, 6, 18, 12],
        [-6, 24, 0, 18, 6, 24],
        [-18, 12, -12, 6],
        [-18, 12, -18, -12, -6, -24, 6, -24, 18, -12, 18, 12, 6, 24, -6,
            24, -18, 12], [-15, -15, -18, -24, -9, -21],
        [9, -21, 18, -24, 15, -15], [15, 15, 18, 24, 9, 21],
        [-9, 21, -18, 24, -15, 15], [-3, 24, 0, 30, 3, 24],
        [-6, -24, -12, -36, -6, -48, 6, -48, 12, -36, 6, -24]],
    // Left
    [[-12, -6, -12, 6, 0, 18, 12, 6, 12, -6, 0, -18, -12, -6],
        [-18, -12, -12, -6],
        [-6, -24, 0, -18, 6, -24],
        [12, -6, 18, -12],
        [12, 6, 18, 12],
        [-6, 24, 0, 18, 6, 24],
        [-18, 12, -12, 6],
        [-18, 12, -18, -12, -6, -24, 6, -24, 18, -12, 18, 12, 6, 24, -6,
            24, -18, 12], [-15, -15, -24, -18, -9, -21],
        [-9, 21, -24, 18, -15, 15], [-3, 24, -3, 30, 3, 24],
        [-6, -24, -6, -36, 0, -48, 12, -48, 18, -36, 6, -24],
        [9, -21, 18, -30, 15, -15], [15, 15, 18, 30, 9, 21]],
    // Right
    [
        [-12, -6, -12, 6, 0, 18, 12, 6, 12, -6, 0, -18, -12, -6],
        [-18, -12, -12, -6],
        [-6, -24, 0, -18, 6, -24],
        [12, -6, 18, -12],
        [12, 6, 18, 12],
        [-6, 24, 0, 18, 6, 24],
        [-18, 12, -12, 6],
        [-18, 12, -18, -12, -6, -24, 6, -24, 18, -12, 18, 12, 6, 24, -6,
            24, -18, 12], [-15, -15, -18, -30, -9, -21],
        [-9, 21, -18, 30, -15, 15], [-3, 24, 3, 30, 3, 24],
        [-6, -24, -18, -36, -12, -48, 0, -48, 6, -36, 6, -24],
        [9, -21, 24, -18, 15, -15], [15, 15, 24, 18, 9, 21]]
];

// テキストタートルのローマテーブル
// http://echokoda.y0r.net/wp/wp-content/uploads/2010/04/RomaMSIME.txt の重複[fu],[ffu]と[n]を削除
var romanTable = [
    {key: '-', val: 'ー'},
    {key: '~', val: '〜'},
    {key: '.', val: '。'},
    {key: ',', val: '、'},
    {key: 'z/', val: '・'},
    {key: 'z.', val: '…'},
    {key: 'z,', val: '‥'},
    {key: 'zh', val: '←'},
    {key: 'zj', val: '↓'},
    {key: 'zk', val: '↑'},
    {key: 'zl', val: '→'},
    {key: 'z-', val: '〜'},
    {key: 'z[', val: '『'},
    {key: 'z]', val: '』'},
    {key: '[', val: '「'},
    {key: ']', val: '」'},
    {key: 'vva', val: 'っゔぁ'},
    {key: 'vvi', val: 'っゔぃ'},
    {key: 'vvu', val: 'っゔ'},
    {key: 'vve', val: 'っゔぇ'},
    {key: 'vvo', val: 'っゔぉ'},
    {key: 'vvya', val: 'っゔゃ'},
    {key: 'vvyi', val: 'っゔぃ'},
    {key: 'vvyu', val: 'っゔゅ'},
    {key: 'vvye', val: 'っゔぇ'},
    {key: 'vvyo', val: 'っゔょ'},
    {key: 'kkya', val: 'っきゃ'},
    {key: 'kkyi', val: 'っきぃ'},
    {key: 'kkyu', val: 'っきゅ'},
    {key: 'kkye', val: 'っきぇ'},
    {key: 'kkyo', val: 'っきょ'},
    {key: 'ggya', val: 'っぎゃ'},
    {key: 'ggyi', val: 'っぎぃ'},
    {key: 'ggyu', val: 'っぎゅ'},
    {key: 'ggye', val: 'っぎぇ'},
    {key: 'ggyo', val: 'っぎょ'},
    {key: 'ssya', val: 'っしゃ'},
    {key: 'ssyi', val: 'っしぃ'},
    {key: 'ssyu', val: 'っしゅ'},
    {key: 'ssye', val: 'っしぇ'},
    {key: 'ssyo', val: 'っしょ'},
    {key: 'ssha', val: 'っしゃ'},
    {key: 'sshi', val: 'っし'},
    {key: 'sshu', val: 'っしゅ'},
    {key: 'sshe', val: 'っしぇ'},
    {key: 'ssho', val: 'っしょ'},
    {key: 'zzya', val: 'っじゃ'},
    {key: 'zzyi', val: 'っじぃ'},
    {key: 'zzyu', val: 'っじゅ'},
    {key: 'zzye', val: 'っじぇ'},
    {key: 'zzyo', val: 'っじょ'},
    {key: 'ttya', val: 'っちゃ'},
    {key: 'ttyi', val: 'っちぃ'},
    {key: 'ttyu', val: 'っちゅ'},
    {key: 'ttye', val: 'っちぇ'},
    {key: 'ttyo', val: 'っちょ'},
    {key: 'ccha', val: 'っちゃ'},
    {key: 'cchi', val: 'っち'},
    {key: 'cchu', val: 'っちゅ'},
    {key: 'cche', val: 'っちぇ'},
    {key: 'ccho', val: 'っちょ'},
    {key: 'ccya', val: 'っちゃ'},
    {key: 'ccyi', val: 'っちぃ'},
    {key: 'ccyu', val: 'っちゅ'},
    {key: 'ccye', val: 'っちぇ'},
    {key: 'ccyo', val: 'っちょ'},
    {key: 'ddya', val: 'っぢゃ'},
    {key: 'ddyi', val: 'っぢぃ'},
    {key: 'ddyu', val: 'っぢゅ'},
    {key: 'ddye', val: 'っぢぇ'},
    {key: 'ddyo', val: 'っぢょ'},
    {key: 'ttsa', val: 'っつぁ'},
    {key: 'ttsi', val: 'っつぃ'},
    {key: 'ttse', val: 'っつぇ'},
    {key: 'ttso', val: 'っつぉ'},
    {key: 'ttha', val: 'ってゃ'},
    {key: 'tthi', val: 'ってぃ'},
    {key: 'tt\'i', val: 'ってぃ'},
    {key: 'tthu', val: 'ってゅ'},
    {key: 'tthe', val: 'ってぇ'},
    {key: 'ttho', val: 'ってょ'},
    {key: 'tt\'yu', val: 'ってゅ'},
    {key: 'ddha', val: 'っでゃ'},
    {key: 'ddhi', val: 'っでぃ'},
    {key: 'dd\'i', val: 'っでぃ'},
    {key: 'ddhu', val: 'っでゅ'},
    {key: 'ddhe', val: 'っでぇ'},
    {key: 'ddho', val: 'っでょ'},
    {key: 'dd\'yu', val: 'っでゅ'},
    {key: 'ttwa', val: 'っとぁ'},
    {key: 'ttwi', val: 'っとぃ'},
    {key: 'ttwu', val: 'っとぅ'},
    {key: 'ttwe', val: 'っとぇ'},
    {key: 'ttwo', val: 'っとぉ'},
    {key: 'tt\'u', val: 'っとぅ'},
    {key: 'ddwa', val: 'っどぁ'},
    {key: 'ddwi', val: 'っどぃ'},
    {key: 'ddwu', val: 'っどぅ'},
    {key: 'ddwe', val: 'っどぇ'},
    {key: 'ddwo', val: 'っどぉ'},
    {key: 'dd\'u', val: 'っどぅ'},
    {key: 'hhya', val: 'っひゃ'},
    {key: 'hhyi', val: 'っひぃ'},
    {key: 'hhyu', val: 'っひゅ'},
    {key: 'hhye', val: 'っひぇ'},
    {key: 'hhyo', val: 'っひょ'},
    {key: 'bbya', val: 'っびゃ'},
    {key: 'bbyi', val: 'っびぃ'},
    {key: 'bbyu', val: 'っびゅ'},
    {key: 'bbye', val: 'っびぇ'},
    {key: 'bbyo', val: 'っびょ'},
    {key: 'ppya', val: 'っぴゃ'},
    {key: 'ppyi', val: 'っぴぃ'},
    {key: 'ppyu', val: 'っぴゅ'},
    {key: 'ppye', val: 'っぴぇ'},
    {key: 'ppyo', val: 'っぴょ'},
    {key: 'ffa', val: 'っふぁ'},
    {key: 'ffi', val: 'っふぃ'},
    {key: 'ffe', val: 'っふぇ'},
    {key: 'ffo', val: 'っふぉ'},
    {key: 'ffya', val: 'っふゃ'},
    {key: 'ffyu', val: 'っふゅ'},
    {key: 'ffyo', val: 'っふょ'},
    {key: 'hhwa', val: 'っふぁ'},
    {key: 'hhwi', val: 'っふぃ'},
    {key: 'hhwe', val: 'っふぇ'},
    {key: 'hhwo', val: 'っふぉ'},
    {key: 'hhwyu', val: 'っふゅ'},
    {key: 'mmya', val: 'っみゃ'},
    {key: 'mmyi', val: 'っみぃ'},
    {key: 'mmyu', val: 'っみゅ'},
    {key: 'mmye', val: 'っみぇ'},
    {key: 'mmyo', val: 'っみょ'},
    {key: 'rrya', val: 'っりゃ'},
    {key: 'rryi', val: 'っりぃ'},
    {key: 'rryu', val: 'っりゅ'},
    {key: 'rrye', val: 'っりぇ'},
    {key: 'rryo', val: 'っりょ'},
    {key: 'xxn', val: 'っん'},
    {key: 'xxa', val: 'っぁ'},
    {key: 'xxi', val: 'っぃ'},
    {key: 'xxu', val: 'っぅ'},
    {key: 'xxe', val: 'っぇ'},
    {key: 'xxo', val: 'っぉ'},
    {key: 'lla', val: 'っぁ'},
    {key: 'lli', val: 'っぃ'},
    {key: 'llu', val: 'っぅ'},
    {key: 'lle', val: 'っぇ'},
    {key: 'llo', val: 'っぉ'},
    {key: 'llyi', val: 'っぃ'},
    {key: 'xxyi', val: 'っぃ'},
    {key: 'llye', val: 'っぇ'},
    {key: 'xxye', val: 'っぇ'},
    {key: 'yye', val: 'っいぇ'},
    {key: 'kka', val: 'っか'},
    {key: 'kki', val: 'っき'},
    {key: 'kku', val: 'っく'},
    {key: 'kke', val: 'っけ'},
    {key: 'kko', val: 'っこ'},
    {key: 'xxka', val: 'っヵ'},
    {key: 'xxke', val: 'っヶ'},
    {key: 'llka', val: 'っヵ'},
    {key: 'llke', val: 'っヶ'},
    {key: 'gga', val: 'っが'},
    {key: 'ggi', val: 'っぎ'},
    {key: 'ggu', val: 'っぐ'},
    {key: 'gge', val: 'っげ'},
    {key: 'ggo', val: 'っご'},
    {key: 'ssa', val: 'っさ'},
    {key: 'ssi', val: 'っし'},
    {key: 'ssu', val: 'っす'},
    {key: 'sse', val: 'っせ'},
    {key: 'sso', val: 'っそ'},
    {key: 'cca', val: 'っか'},
    {key: 'cci', val: 'っし'},
    {key: 'ccu', val: 'っく'},
    {key: 'cce', val: 'っせ'},
    {key: 'cco', val: 'っこ'},
    {key: 'qqa', val: 'っくぁ'},
    {key: 'qqi', val: 'っくぃ'},
    {key: 'qqu', val: 'っく'},
    {key: 'qqe', val: 'っくぇ'},
    {key: 'qqo', val: 'っくぉ'},
    {key: 'kkwa', val: 'っくぁ'},
    {key: 'kkwi', val: 'っくぃ'},
    {key: 'kkwe', val: 'っくぇ'},
    {key: 'kkwo', val: 'っくぉ'},
    {key: 'ggwa', val: 'っぐぁ'},
    {key: 'zza', val: 'っざ'},
    {key: 'zzi', val: 'っじ'},
    {key: 'zzu', val: 'っず'},
    {key: 'zze', val: 'っぜ'},
    {key: 'zzo', val: 'っぞ'},
    {key: 'jja', val: 'っじゃ'},
    {key: 'jji', val: 'っじ'},
    {key: 'jju', val: 'っじゅ'},
    {key: 'jje', val: 'っじぇ'},
    {key: 'jjo', val: 'っじょ'},
    {key: 'jjya', val: 'っじゃ'},
    {key: 'jjyi', val: 'っじぃ'},
    {key: 'jjyu', val: 'っじゅ'},
    {key: 'jjye', val: 'っじぇ'},
    {key: 'jjyo', val: 'っじょ'},
    {key: 'tta', val: 'った'},
    {key: 'tti', val: 'っち'},
    {key: 'ttu', val: 'っつ'},
    {key: 'ttsu', val: 'っつ'},
    {key: 'tte', val: 'って'},
    {key: 'tto', val: 'っと'},
    {key: 'dda', val: 'っだ'},
    {key: 'ddi', val: 'っぢ'},
    {key: 'ddu', val: 'っづ'},
    {key: 'dde', val: 'っで'},
    {key: 'ddo', val: 'っど'},
    {key: 'xxtu', val: 'っっ'},
    {key: 'xxtsu', val: 'っっ'},
    {key: 'lltu', val: 'っっ'},
    {key: 'lltsu', val: 'っっ'},
    {key: 'hha', val: 'っは'},
    {key: 'hhi', val: 'っひ'},
    {key: 'hhu', val: 'っふ'},
    {key: 'ffu', val: 'っふ'},
    {key: 'hhe', val: 'っへ'},
    {key: 'hho', val: 'っほ'},
    {key: 'bba', val: 'っば'},
    {key: 'bbi', val: 'っび'},
    {key: 'bbu', val: 'っぶ'},
    {key: 'bbe', val: 'っべ'},
    {key: 'bbo', val: 'っぼ'},
    {key: 'ppa', val: 'っぱ'},
    {key: 'ppi', val: 'っぴ'},
    {key: 'ppu', val: 'っぷ'},
    {key: 'ppe', val: 'っぺ'},
    {key: 'ppo', val: 'っぽ'},
    {key: 'mma', val: 'っま'},
    {key: 'mmi', val: 'っみ'},
    {key: 'mmu', val: 'っむ'},
    {key: 'mme', val: 'っめ'},
    {key: 'mmo', val: 'っも'},
    {key: 'xxya', val: 'っゃ'},
    {key: 'llya', val: 'っゃ'},
    {key: 'yya', val: 'っや'},
    {key: 'wwyi', val: 'っゐ'},
    {key: 'xxyu', val: 'っゅ'},
    {key: 'llyu', val: 'っゅ'},
    {key: 'yyu', val: 'っゆ'},
    {key: 'wwye', val: 'っゑ'},
    {key: 'xxyo', val: 'っょ'},
    {key: 'llyo', val: 'っょ'},
    {key: 'yyo', val: 'っよ'},
    {key: 'rra', val: 'っら'},
    {key: 'rri', val: 'っり'},
    {key: 'rru', val: 'っる'},
    {key: 'rre', val: 'っれ'},
    {key: 'rro', val: 'っろ'},
    {key: 'xxwa', val: 'っゎ'},
    {key: 'llwa', val: 'っゎ'},
    {key: 'wwa', val: 'っわ'},
    {key: 'wwi', val: 'っうぃ'},
    {key: 'wwe', val: 'っうぇ'},
    {key: 'wwo', val: 'っを'},
    {key: 'wwha', val: 'っうぁ'},
    {key: 'wwhi', val: 'っうぃ'},
    {key: 'wwhu', val: 'っう'},
    {key: 'wwhe', val: 'っうぇ'},
    {key: 'wwho', val: 'っうぉ'},
    {key: 'va', val: 'ゔぁ'},
    {key: 'vi', val: 'ゔぃ'},
    {key: 'vu', val: 'ゔ'},
    {key: 've', val: 'ゔぇ'},
    {key: 'vo', val: 'ゔぉ'},
    {key: 'vya', val: 'ゔゃ'},
    {key: 'vyi', val: 'ゔぃ'},
    {key: 'vyu', val: 'ゔゅ'},
    {key: 'vye', val: 'ゔぇ'},
    {key: 'vyo', val: 'ゔょ'},
    {key: 'kya', val: 'きゃ'},
    {key: 'kyi', val: 'きぃ'},
    {key: 'kyu', val: 'きゅ'},
    {key: 'kye', val: 'きぇ'},
    {key: 'kyo', val: 'きょ'},
    {key: 'gya', val: 'ぎゃ'},
    {key: 'gyi', val: 'ぎぃ'},
    {key: 'gyu', val: 'ぎゅ'},
    {key: 'gye', val: 'ぎぇ'},
    {key: 'gyo', val: 'ぎょ'},
    {key: 'sya', val: 'しゃ'},
    {key: 'syi', val: 'しぃ'},
    {key: 'syu', val: 'しゅ'},
    {key: 'sye', val: 'しぇ'},
    {key: 'syo', val: 'しょ'},
    {key: 'sha', val: 'しゃ'},
    {key: 'shi', val: 'し'},
    {key: 'shu', val: 'しゅ'},
    {key: 'she', val: 'しぇ'},
    {key: 'sho', val: 'しょ'},
    {key: 'zya', val: 'じゃ'},
    {key: 'zyi', val: 'じぃ'},
    {key: 'zyu', val: 'じゅ'},
    {key: 'zye', val: 'じぇ'},
    {key: 'zyo', val: 'じょ'},
    {key: 'tya', val: 'ちゃ'},
    {key: 'tyi', val: 'ちぃ'},
    {key: 'tyu', val: 'ちゅ'},
    {key: 'tye', val: 'ちぇ'},
    {key: 'tyo', val: 'ちょ'},
    {key: 'cha', val: 'ちゃ'},
    {key: 'chi', val: 'ち'},
    {key: 'chu', val: 'ちゅ'},
    {key: 'che', val: 'ちぇ'},
    {key: 'cho', val: 'ちょ'},
    {key: 'cya', val: 'ちゃ'},
    {key: 'cyi', val: 'ちぃ'},
    {key: 'cyu', val: 'ちゅ'},
    {key: 'cye', val: 'ちぇ'},
    {key: 'cyo', val: 'ちょ'},
    {key: 'dya', val: 'ぢゃ'},
    {key: 'dyi', val: 'ぢぃ'},
    {key: 'dyu', val: 'ぢゅ'},
    {key: 'dye', val: 'ぢぇ'},
    {key: 'dyo', val: 'ぢょ'},
    {key: 'tsa', val: 'つぁ'},
    {key: 'tsi', val: 'つぃ'},
    {key: 'tse', val: 'つぇ'},
    {key: 'tso', val: 'つぉ'},
    {key: 'tha', val: 'てゃ'},
    {key: 'thi', val: 'てぃ'},
    {key: 't\'i', val: 'てぃ'},
    {key: 'thu', val: 'てゅ'},
    {key: 'the', val: 'てぇ'},
    {key: 'tho', val: 'てょ'},
    {key: 't\'yu', val: 'てゅ'},
    {key: 'dha', val: 'でゃ'},
    {key: 'dhi', val: 'でぃ'},
    {key: 'd\'i', val: 'でぃ'},
    {key: 'dhu', val: 'でゅ'},
    {key: 'dhe', val: 'でぇ'},
    {key: 'dho', val: 'でょ'},
    {key: 'd\'yu', val: 'でゅ'},
    {key: 'twa', val: 'とぁ'},
    {key: 'twi', val: 'とぃ'},
    {key: 'twu', val: 'とぅ'},
    {key: 'twe', val: 'とぇ'},
    {key: 'two', val: 'とぉ'},
    {key: 't\'u', val: 'とぅ'},
    {key: 'dwa', val: 'どぁ'},
    {key: 'dwi', val: 'どぃ'},
    {key: 'dwu', val: 'どぅ'},
    {key: 'dwe', val: 'どぇ'},
    {key: 'dwo', val: 'どぉ'},
    {key: 'd\'u', val: 'どぅ'},
    {key: 'nya', val: 'にゃ'},
    {key: 'nyi', val: 'にぃ'},
    {key: 'nyu', val: 'にゅ'},
    {key: 'nye', val: 'にぇ'},
    {key: 'nyo', val: 'にょ'},
    {key: 'ny', val: 'んy'},
    {key: 'hya', val: 'ひゃ'},
    {key: 'hyi', val: 'ひぃ'},
    {key: 'hyu', val: 'ひゅ'},
    {key: 'hye', val: 'ひぇ'},
    {key: 'hyo', val: 'ひょ'},
    {key: 'bya', val: 'びゃ'},
    {key: 'byi', val: 'びぃ'},
    {key: 'byu', val: 'びゅ'},
    {key: 'bye', val: 'びぇ'},
    {key: 'byo', val: 'びょ'},
    {key: 'pya', val: 'ぴゃ'},
    {key: 'pyi', val: 'ぴぃ'},
    {key: 'pyu', val: 'ぴゅ'},
    {key: 'pye', val: 'ぴぇ'},
    {key: 'pyo', val: 'ぴょ'},
    {key: 'fa', val: 'ふぁ'},
    {key: 'fi', val: 'ふぃ'},
    {key: 'fe', val: 'ふぇ'},
    {key: 'fo', val: 'ふぉ'},
    {key: 'fya', val: 'ふゃ'},
    {key: 'fyu', val: 'ふゅ'},
    {key: 'fyo', val: 'ふょ'},
    {key: 'hwa', val: 'ふぁ'},
    {key: 'hwi', val: 'ふぃ'},
    {key: 'hwe', val: 'ふぇ'},
    {key: 'hwo', val: 'ふぉ'},
    {key: 'hwyu', val: 'ふゅ'},
    {key: 'mya', val: 'みゃ'},
    {key: 'myi', val: 'みぃ'},
    {key: 'myu', val: 'みゅ'},
    {key: 'mye', val: 'みぇ'},
    {key: 'myo', val: 'みょ'},
    {key: 'rya', val: 'りゃ'},
    {key: 'ryi', val: 'りぃ'},
    {key: 'ryu', val: 'りゅ'},
    {key: 'rye', val: 'りぇ'},
    {key: 'ryo', val: 'りょ'},
    {key: 'n\'', val: 'ん'},
    {key: 'nn', val: 'ん'},
    {key: 'xn', val: 'ん'},
    {key: 'a', val: 'あ'},
    {key: 'i', val: 'い'},
    {key: 'u', val: 'う'},
    {key: 'wu', val: 'う'},
    {key: 'e', val: 'え'},
    {key: 'o', val: 'お'},
    {key: 'xa', val: 'ぁ'},
    {key: 'xi', val: 'ぃ'},
    {key: 'xu', val: 'ぅ'},
    {key: 'xe', val: 'ぇ'},
    {key: 'xo', val: 'ぉ'},
    {key: 'la', val: 'ぁ'},
    {key: 'li', val: 'ぃ'},
    {key: 'lu', val: 'ぅ'},
    {key: 'le', val: 'ぇ'},
    {key: 'lo', val: 'ぉ'},
    {key: 'lyi', val: 'ぃ'},
    {key: 'xyi', val: 'ぃ'},
    {key: 'lye', val: 'ぇ'},
    {key: 'xye', val: 'ぇ'},
    {key: 'ye', val: 'いぇ'},
    {key: 'ka', val: 'か'},
    {key: 'ki', val: 'き'},
    {key: 'ku', val: 'く'},
    {key: 'ke', val: 'け'},
    {key: 'ko', val: 'こ'},
    {key: 'xka', val: 'ヵ'},
    {key: 'xke', val: 'ヶ'},
    {key: 'lka', val: 'ヵ'},
    {key: 'lke', val: 'ヶ'},
    {key: 'ga', val: 'が'},
    {key: 'gi', val: 'ぎ'},
    {key: 'gu', val: 'ぐ'},
    {key: 'ge', val: 'げ'},
    {key: 'go', val: 'ご'},
    {key: 'sa', val: 'さ'},
    {key: 'si', val: 'し'},
    {key: 'su', val: 'す'},
    {key: 'se', val: 'せ'},
    {key: 'so', val: 'そ'},
    {key: 'ca', val: 'か'},
    {key: 'ci', val: 'し'},
    {key: 'cu', val: 'く'},
    {key: 'ce', val: 'せ'},
    {key: 'co', val: 'こ'},
    {key: 'qa', val: 'くぁ'},
    {key: 'qi', val: 'くぃ'},
    {key: 'qu', val: 'く'},
    {key: 'qe', val: 'くぇ'},
    {key: 'qo', val: 'くぉ'},
    {key: 'kwa', val: 'くぁ'},
    {key: 'kwi', val: 'くぃ'},
    {key: 'kwe', val: 'くぇ'},
    {key: 'kwo', val: 'くぉ'},
    {key: 'gwa', val: 'ぐぁ'},
    {key: 'za', val: 'ざ'},
    {key: 'zi', val: 'じ'},
    {key: 'zu', val: 'ず'},
    {key: 'ze', val: 'ぜ'},
    {key: 'zo', val: 'ぞ'},
    {key: 'ja', val: 'じゃ'},
    {key: 'ji', val: 'じ'},
    {key: 'ju', val: 'じゅ'},
    {key: 'je', val: 'じぇ'},
    {key: 'jo', val: 'じょ'},
    {key: 'jya', val: 'じゃ'},
    {key: 'jyi', val: 'じぃ'},
    {key: 'jyu', val: 'じゅ'},
    {key: 'jye', val: 'じぇ'},
    {key: 'jyo', val: 'じょ'},
    {key: 'ta', val: 'た'},
    {key: 'ti', val: 'ち'},
    {key: 'tu', val: 'つ'},
    {key: 'tsu', val: 'つ'},
    {key: 'te', val: 'て'},
    {key: 'to', val: 'と'},
    {key: 'da', val: 'だ'},
    {key: 'di', val: 'ぢ'},
    {key: 'du', val: 'づ'},
    {key: 'de', val: 'で'},
    {key: 'do', val: 'ど'},
    {key: 'xtu', val: 'っ'},
    {key: 'xtsu', val: 'っ'},
    {key: 'ltu', val: 'っ'},
    {key: 'ltsu', val: 'っ'},
    {key: 'na', val: 'な'},
    {key: 'ni', val: 'に'},
    {key: 'nu', val: 'ぬ'},
    {key: 'ne', val: 'ね'},
    {key: 'no', val: 'の'},
    {key: 'ha', val: 'は'},
    {key: 'hi', val: 'ひ'},
    {key: 'hu', val: 'ふ'},
    {key: 'fu', val: 'ふ'},
    {key: 'he', val: 'へ'},
    {key: 'ho', val: 'ほ'},
    {key: 'ba', val: 'ば'},
    {key: 'bi', val: 'び'},
    {key: 'bu', val: 'ぶ'},
    {key: 'be', val: 'べ'},
    {key: 'bo', val: 'ぼ'},
    {key: 'pa', val: 'ぱ'},
    {key: 'pi', val: 'ぴ'},
    {key: 'pu', val: 'ぷ'},
    {key: 'pe', val: 'ぺ'},
    {key: 'po', val: 'ぽ'},
    {key: 'ma', val: 'ま'},
    {key: 'mi', val: 'み'},
    {key: 'mu', val: 'む'},
    {key: 'me', val: 'め'},
    {key: 'mo', val: 'も'},
    {key: 'xya', val: 'ゃ'},
    {key: 'lya', val: 'ゃ'},
    {key: 'ya', val: 'や'},
    {key: 'wyi', val: 'ゐ'},
    {key: 'xyu', val: 'ゅ'},
    {key: 'lyu', val: 'ゅ'},
    {key: 'yu', val: 'ゆ'},
    {key: 'wye', val: 'ゑ'},
    {key: 'xyo', val: 'ょ'},
    {key: 'lyo', val: 'ょ'},
    {key: 'yo', val: 'よ'},
    {key: 'ra', val: 'ら'},
    {key: 'ri', val: 'り'},
    {key: 'ru', val: 'る'},
    {key: 're', val: 'れ'},
    {key: 'ro', val: 'ろ'},
    {key: 'xwa', val: 'ゎ'},
    {key: 'lwa', val: 'ゎ'},
    {key: 'wa', val: 'わ'},
    {key: 'wi', val: 'うぃ'},
    {key: 'we', val: 'うぇ'},
    {key: 'wo', val: 'を'},
    {key: 'wha', val: 'うぁ'},
    {key: 'whi', val: 'うぃ'},
    {key: 'whu', val: 'う'},
    {key: 'whe', val: 'うぇ'},
    {key: 'who', val: 'うぉ'}
];
romanTable.sort(function (a, b) {
    return (a.key.length > b.key.length) ? -1 : 1;
});
