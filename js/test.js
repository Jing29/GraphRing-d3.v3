//测试数据
var arcDataInTest = [{'name':'gender', 'data':[{'name':'boy', 'val':4}, {'name':'girl', 'val':2}]}, 
{'name':'class', 'data':[{'name':'class1', 'val':2}, {'name':'class2', 'val':2}, {'name':'class3', 'val':2}]}];

var graphDataInTest = {'nodes':[{'id':'node1', 'gender':'boy', 'class':'class1'},
{'id':'node2', 'gender':'boy', 'class':'class2'},{'id':'node3', 'gender':'boy', 'class':'class3'},
{'id':'node4', 'gender':'boy', 'class':'class1'},{'id':'node5', 'gender':'girl', 'class':'class3'},
{'id':'node6', 'gender':'girl', 'class':'class2'}]};
graphDataInTest.links = [{'source':0, 'target':1}, 
{'source':0, 'target':4},{'source':1, 'target':2}, {'source':1, 'target':4},{'source':2, 'target':3}, 
{'source':2, 'target':4},{'source':2, 'target':5}, {'source':4, 'target':5}];

//申请_GraphRing类型的实体
var graphBag = _GraphRing();
//设置view在页面的位置'testView'，设置graphData和arcData。start用于计算并绘制视图
graphBag._setDivId('testView')._setGraphData(graphDataInTest)._setArcData(arcDataInTest)._start();

