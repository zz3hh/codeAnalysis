(function( app ) {
	// 引入命名空间
	var services = app.ns("services");
	var ux = app.ns("ux");

	// 定义集群状态的service
	services.ClusterState = ux.Observable.extend({
		defaults: {
			cluster: null
		},
		init: function() {
			this._super();
			// 集群
			this.cluster = this.config.cluster;
			// 集群状态
			this.clusterState = null;
			// 状态
			this.status = null;
			// 节点状态
			this.nodeStats = null;
			// 集群节点
			this.clusterNodes = null;
		},
		refresh: function() {
			var self = this, clusterState, status, nodeStats, clusterNodes, clusterHealth;
			function updateModel() {
				// 只有当五条请求全部完成后参与赋值并且传播事件
				if( clusterState && status && nodeStats && clusterNodes && clusterHealth ) {
					this.clusterState = clusterState;
					this.status = status;
					this.nodeStats = nodeStats;
					this.clusterNodes = clusterNodes;
					this.clusterHealth = clusterHealth;
					this.fire( "data", this );
				}
			}
			this.cluster.get("_cluster/state", function( data ) {
				clusterState = data;
				updateModel.call( self );
			});
			this.cluster.get("_stats", function( data ) {
				status = data;
				updateModel.call( self );
			});
			this.cluster.get("_nodes/stats", function( data ) {
				nodeStats = data;
				updateModel.call( self );
			});
			this.cluster.get("_nodes", function( data ) {
				clusterNodes = data;
				updateModel.call( self );
			});
			this.cluster.get("_cluster/health", function( data ) {
				clusterHealth = data;
				updateModel.call( self );
			});
		}, 
		_clusterState_handler: function(state) {
			this.clusterState = state;
			this.redraw("clusterState");
		},
		_status_handler: function(status) {
			this.status = status;
			this.redraw("status");
		},
		_clusterNodeStats_handler: function(stats) {
			this.nodeStats = stats;
			this.redraw("nodeStats");
		},
		_clusterNodes_handler: function(nodes) {
			this.clusterNodes = nodes;
			this.redraw("clusterNodes");
		},
		_clusterHealth_handler: function(health) {
			this.clusterHealth = health;
			this.redraw("status");
		}
	});

})( this.app );
