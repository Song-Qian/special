/**
 * Developer	:	SongQian
 * Time			:	2018-11-28
 * e-Mail		:	songqian@wtoe.cn
 * Description	:	共公组件toolbar封装，支持增删查改的交互模块
 */

(function() {
	"use strict";
	if(!Vue || !ELEMENT || !_) {
		throw new Error("toolbar 组件依赖vue&elementUi&lodash库，当前环境缺少依赖。")
	}
	
	//获得本周的开始日期
	var getWeekStartDate = function(nowYear,nowMonth,nowDay,nowDayOfWeek) {
	    var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek+1);

	    return weekStartDate;
	}

	//获得本月的开始日期
	var getMonthStartDate = function(nowYear,nowMonth){
	    var monthStartDate = new Date(nowYear, nowMonth, 1);
	    return monthStartDate;
	}
	//获得本年的开始日期
	var getYearStartDate = function(nowYear){
	    var yearStartDate = new Date(nowYear, 0, 1);
	    return yearStartDate;
	}
	
	var toolbar_view = [
	    "<div class='skin-wtoe-aimonitor skin-wtoe-tool-bar'>",
	    	"<div class='skin-wtoe-tool-bar skin-wtoe-bool-bar-box' v-if='hasAction || hasSearchInput'>",
		    	"<el-row type='flex' justify='start'>",
		    		"<el-col :span='16'>",
		    			"<el-button-group v-if='filter.length || add || edit || del' style='margin-right: 20px;'>",
			    			"<el-button size='small' v-if='filter.length' type='primary' icon='fa fa-filter skin-wtoe-aimonitor skin-wtoe-link' @click.stop='dialogShow = !dialogShow'>筛选</el-button>",
			    			"<el-button size='small' v-if='add' type='primary' icon='el-icon-plus' @click='add'>新增</el-button>",
			    			"<el-button size='small' v-if='edit' type='primary' icon='el-icon-edit' @click='edit'>编辑</el-button>",
			    			"<el-button size='small' v-if='del' type='danger' icon='el-icon-delete' @click='del'>删除</el-button>",
		    			"</el-button-group>",
		    			"<el-button-group class='skin-wtoe-aimonitor skin-wtoe-btn-group' v-if='_.size(btns) > 0'>",
		    				"<el-button size='small' type='primary' :plain='true' :disabled='btn.disabled' v-for='btn in btns' :icon='btn.icon' @click='btn.click'>{{btn.text}}</el-button>",
		    			"</el-button-group>",
		    		"</el-col>",
		    		"<el-col v-if='hasSearchInput' :span='8'>",
		    			"<el-input :placeholder='search.text' v-model='search.value' @input='inputSearch'>",
		    				"<el-button slot='prepend' icon='el-icon-search'></el-button>",
		    				"<i class='el-input__icon' slot='suffix' :class=\"{ 'el-icon-loading' : searching,  'el-icon-edit' : !searching }\"></i>",
		    			"</el-input>",
		    		"</el-col>",
		    	"</el-row>",
		    	"<el-row v-show='filterTags.length' style='margin-top: 10px;'>",
		    		"<el-col :span='24'>",
		    			"<el-tag size='small' v-for='tab in filterTags' :key='tab.name' @close='clearFilterItem(tab)' :title='tab.label' style='margin-right:5px;' closable><span style='float:left; display:block; max-width:120px; overflow:hidden; text-overflow:ellipsis;'>{{tab.label}}</span></el-tag>",
		    		"</el-col>",
		    	"</el-row>",
		    "</div>",
		    "<transition name='el-zoom-in-top'>",
			    "<el-card class='box-card skin-wtoe-tool-bar-filter' :style='{ width : componentBBOX.width }' v-show='dialogShow' @click.native.stop='javascript:void 0;'>",
		    		"<div slot='header' class='clearfix'>",
		    			"<span>筛选条件</span>",
		    		"</div>",
		    		"<el-form ref='dialogFilter' label-position='top' size='small'>",
			    		"<section class='skin-wtoe-tool-bar-filter-form-item' :style=\"{ width: item.width || '' }\" v-for='item in filter' :key='item.name'>",
			    			"<el-form-item v-if=\"item.type === 'text'\" :label='item.text'>",
			    				"<el-input :name='item.name' v-model='item.value' placeholder='请输入筛选文本' style='width: 100%;'><i class='el-icon-edit el-input__icon' slot='suffix'></i></el-input>",
			    			"</el-form-item>",
			    			"<el-form-item v-if=\"item.type === 'radio'\" :label='item.text'>",
				    			"<el-radio-group v-model='item.value' style='width: 100%;'>",
					    		    "<el-radio v-for='option in item.options' :label='option.value'>{{option.label}}</el-radio>",
				    		    "</el-radio-group>",
			    		    "</el-form-item>",
			    		    "<el-form-item v-if=\"item.type === 'switch'\" :label='item.text'>",
			    		    	"<el-switch v-model='item.value' active-color='#13ce66' inactive-color='#ff4949' style='width: 100%;'></el-switch>",
			    		    "</el-form-item>",
			    			"<el-form-item v-if=\"item.type === 'select'\" :label='item.text'>",
			    				"<el-select :name='item.name' filterable  style='width:100%' v-model='item.value' placeholder='请选择筛选条件' :multiple=\"item.multiple || false\" clearable>",
				    				"<el-option :label='option.label' :value='option.value' v-for='option in item.options' :key='option.value'></el-option>",
				    			"</el-select>",
			    			"</el-form-item>",
			    			"<el-form-item v-if=\"['year','month','date','week','datetime','datetimerange','daterange'].indexOf(item.type) > -1\" :label='item.text'>",
			    				"<el-date-picker  " +
			    					":name='item.name'" +
			    					"v-model='item.value' " +
			    					"style='width: 100%;' " +
			    					":type='item.type'" +
			    					":fange-separator=\"item.range ? '至' : '' \" " +
			    					":picker-options='item.range ? getPickerOptions : {}' " +
			    					":format='item.format' " +
			    					":value-format='item.format'"+
			    					"start-placeholder='开始时间' " +
			    					"end-placeholder='结束时间' " +
			    					"placeholder='筛选时间'>" +
			    					"</el-date-picker>",
			    			"</el-form-item>",
			    		"</section>",
		                "<el-form-item style='display:block; text-align:center; clear:both;'>",
				    		"<el-button size='small' type='primary' @click='submitDialogFilterForm'>确定</el-button>",
				    		"<el-button size='small' @click='cancelDialogFilterForm'>清空</el-button>",
		                "</el-form-item>",
			    	"</el-form>",
		    	"</el-card>",
		    "</transition>",
	    "</div>"
	].join('');
	
	var watchSearchProps = function(vm, val) {
		vm.searching = true;
		vm.__debounceAsyncSearch();
	};
	
	var toolBarApp = Vue.extend({
		template : toolbar_view,
		props : {
			//单个查询条件工具
			search : {
				default : function() {
					return { name : '', value : '', text : '请输入过滤文本' }
				},
				type : Object
			},
			//增删改事件
			add : Function,
			del : Function,
			edit : Function,
			//自定义button组
			btns : {
				type : Array,
				default : []
			},
			//复合筛选条件过滤工具
			filter : {
				type : Array,
				default : []
			}
		},
		data : function(){
			return {
				dialogShow : false,
				searching : false,
				componentBBOX : {
					width : '0px',
					height: '0px',
					top: 0,
					left: 0
				},
				filterTags : []
			}
		},
		computed : {
			hasAction : function() {
				var me = this;
				return me.add || me.del || me.edit || me.filter.length || me.btns.length;
			},
			hasSearchInput : function() {
				var me = this;
				return me.search.name.replace(/^\s+|\s+$/, '').length;
			},
			getPickerOptions : function() {
				return {
		          shortcuts: [{
                  text: '当天',
                  onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(Date.parse(new Date(start.Format("yyyy-MM-dd"))) - 3600 * 1000 * 8);
                    picker.$emit('pick', [start, end]);
                  }
                  },{
		            text: '本周',
		            onClick(picker) {
		              const end = new Date();
		              const start = new Date();
                      start.setTime(getWeekStartDate(start.getFullYear(),start.getMonth(),start.getDate(),start.getDay()));
		              picker.$emit('pick', [start, end]);
		            }
		          }, {
		            text: '本月',
		            onClick(picker) {
		              const end = new Date();
		              const start = new Date();
		              start.setTime(getMonthStartDate(start.getFullYear(),start.getMonth()));
		              picker.$emit('pick', [start, end]);
		            }
		          }, {
		            text: '本年度',
		            onClick(picker) {
		              const end = new Date();
		              const start = new Date();
                      start.setTime(getYearStartDate(start.getFullYear()));
		              picker.$emit('pick', [start, end]);
		            }
		          }]
				}
			}
		},
		watch : {
			dialogShow : {
				handler : function(newVal,oldVal) {
					var me = this;
					me.resizeChange();
				}
			}
		},
		methods : {
			submitDialogFilterForm : function() {
				var me = this;
				me.resetFilterTags();
				me.$emit("change", me.filter);
			},
			resetFilterTags : function(){
				var me = this;
				me.dialogShow = false;
				me.filterTags = [];
				for(var key in me.filter) {
					if(_.isInteger(me.filter[key].value) || _.isBoolean(me.filter[key].value) ||_.isArray(me.filter[key].value) && _.size(me.filter[key].value) > 0 || _.isString(me.filter[key].value) && me.filter[key].value) {
						var value = _.isArray(me.filter[key].value) ? me.filter[key].value.join(',') : me.filter[key].value;
						var label = me.filter[key].render && me.filter[key].render.apply(me.filter[key]) || value;
						me.filterTags.push({ name : me.filter[key].name, label : label, value : value});
					}
				}
			},
			cancelDialogFilterForm : function() {
				var me = this;
				for(var key in me.filter) {
					var value = _.isArray(me.filter[key].value) ? [] : _.isInteger(me.filter[key].value) ? 0 : _.isBoolean(me.filter[key].value) ? me.filter[key].value : '';
					me.filter[key].value = value;
					me.filterTags = _.dropWhile(me.filterTags, function(e) {
						return  !_.isBoolean(e.value) && e.name === me.filter[key].name;
					})
				}
				me.$emit("change", me.filter);
			},
			resizeChange : function() {
				var me = this;
				me.componentBBOX.width = me.$el.clientWidth + 'px';
				me.$emit('resize', me.$el.clientWidth);
			},
			clearFilterItem : function(item) {
				var me = this;
				for(var key in me.filter) {
					if(me.filter[key].name === item.name) {
						var value = _.isArray(me.filter[key].value) ? [] : _.isInteger(me.filter[key].value) ? 0 : _.isBoolean(me.filter[key].value) ? !me.filter[key].value : '';
						me.filter[key].value = value;
						break;
					}
				}
				me.resetFilterTags();
				me.$emit("change", me.filter);
			},
			inputSearch : function(val) {
				var me = this;
				me.search.value = val || me.search.value;
				watchSearchProps(me, me.search.value);
			},
			changeSearch : function() {
				var me = this;
				me.searching = false;
				me.$emit('change-search', me.search.value);
			}
		},
		mounted : function() {
			var me = this;
			me.$root.$on('hideFilterDialog',function() {
				me.dialogShow = false;
				var i, n;
				for(i = 0, n = me.filter.length; i < n; i++) {
					var value = _.isArray(me.filter[i].value) && _.size(me.filter[i].value) > 0 ? me.filter[i].value : 
									_.isArray(me.filter[i].value) && _.size(me.filter[i].value) === 0 ? [] : 
										_.isInteger(me.filter[i].value) ? 0 : 
											_.isBoolean(me.filter[i].value) ? me.filter[i].value : 
												!me.filter[i].value ? '' : 
													me.filter[i].value;
					me.filter[i].value = value;
				}
			});
			window.onresize = me.resizeChange.bind(me);
			me.__debounceAsyncSearch = _.debounce(me.changeSearch, 500);
			me.componentBBOX.width = me.$el.clientWidth + 'px';
			me.resetFilterTags();
		}
	})
	
	Vue.component('tool-bar-grid', toolBarApp);
})();