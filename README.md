# GraphRing-d3.v3


##1.	使用
###1）	引用文件_graphRing.js。在此之前，需引用d3.js (<= version 3.0)、jquery.js (version2.1.4)、d3-tip.js (Copyright (c) 2013 Justin Palmer)。
###2）	引用文件graph-ring.less

##2.	功能介绍
###1）	hover圆弧，显示圆弧的名字
###2）	刷选node-link视图；按住shift，在原刷选结果上，修改刷选结果
###3）	点击圆弧，满足条件的节点将高亮；其他圆弧将显示高亮的元素占该圆弧的比例。点击选择圆弧，同个环上的圆弧之间支持或操作；不同圆环之间的选择支持与操作。

##3.	接口
###1)	_setGraphData
    Input: {'nodes':[], 'links':[]}, each node needs a specific id key
    Output: return this
###2)	_setArcData
    Input: [{'className':, 'data':[{'name':, 'val':}, {}]}, {}]
    Output: return this
###3)	_setDivId
    设置view在页面的位置。_setDivId和_setG任选一项，设置view所在的位置
    输入：div的id值
    输出：return this
###4)	_setG
    设置view在页面的位置。_setG和_setDivId任选一项，设置view所在的位置
    输入：g的id值
    输出：return this
###5)	_setViewSize
    设置view的大小
    输入：数组，第一项表示width的大小，第二项表示height的大小。单位时px
    输出：return this
###6)	_setLinkStrength
    设置力导向算法，边的吸引力。默认值是0.1
    输入：数值或函数
    输出：return this
###7)	_setCharge
    设置节点之间的斥力。默认值是－30
    输入：数值或函数
    输出：return this
###8)	_setGravity
    The force layout uses this property to keep nodes from wandering off the edges of the visualization, something they might otherwise do to avoid overlap. Gravity applies to the entire force layout and not individual links or nodes. 默认值是0.1。
    输入：数值或函数
    输出：return this
###9)	_setLinkDistance
    设置边的理想长度。默认值是20
    输入：数值或函数
    输出：return this
###10)	 _getAlpha
    获取力导向算法的alpha值。Alpha会随着迭代的进度从0.1一直降至0
    输入：无
    输出：数值
###11)	 _setNodeSize
    设置节点的大小
    输入：数值或函数
    输出：return this
###12)	_setArcInnerRadius
    设置圆环的内半径
    输入：数值
    输出：return this
###13)	_setArcOuterRadius
    设置圆环的外半径
    输入：数值
    输出：return this
###14)	_setArcGap
    设置圆环之间的距离
    输入：数值
    输出：return this
###15)	_setStartAngle
    设置圆弧的开始角度。单位是弧度
    输入：数值
    输出：return this
###16)	_setEndAngle
    设置圆弧的结束角度。单位是弧度
    输入：数值
    输出：return this
###17)	_setPiePadAngle
    设置圆弧之间的间距。单位是弧度
    输入：数值
    输出：return this
###18)	_setNodeToHightlight
    设置高亮的顶点。此接口用于外界传入需高亮的元素，以便实现视图间的联动交互
    输入：数组。每一项是节点的id值
    输出：return this
###19)	_getNodeInHighlight
    获取高亮节点的信息。此接口用于外界获取graphRing中高亮的节点。
    输入：无
    输出：数组。每一项是节点的id值
###20)	_start
    开始视图的计算和绘制
    输入：无
    输出：return this
###21)	_stop
    结束视图的计算，主要是指结束力导向布局的计算
    输入：无
    输出：return this
###22)	_forceStart
    计算力导向布局
    输入：无
    输出：return this

##4.	范例
###1)	引用_graphRing和相关的依赖文件
    ![][img/p1.png]
###2)	设置view
    ![][img/p2.png]
###3)   绘制graphRing
    ![][img/p3.png]
###4)	效果图
    ![][img/p4.png]







