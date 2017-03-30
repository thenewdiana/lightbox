define(['jquery'],function($){
  var Lightbox = function(){
    var self = this;
    //创建遮罩和弹出框
    this.popupMask = $('<div class="mask">');
    this.popupWindow = $('<div class="popup">');
    //保存 body
    this.bodyNode = $(document.body);

    //渲染剩余的 DOM，并插入到 body
    this.renderDOM();
    
    this.picViewArea = this.popupWindow.find('.view');//获取图片预览区域
    this.popupPic = this.popupWindow.find('.pic');//图片
    this.picCaption = this.popupWindow.find('.caption');//图片描述区域
    this.nextBtn = this.popupWindow.find('.next');
    this.prevBtn = this.popupWindow.find('.prev');
    this.captionText = this.popupWindow.find('.desc');//图片描述内容
    this.curIndex = this.popupWindow.find('.index');//图片索引
    this.closeBtn = this.popupWindow.find('.close');//关闭按钮
    this.groupName = null;
    this.groupData = [];//放置同一组数据
    //准备开发事件委托，获取组数据
    this.bodyNode.delegate('.js-lightbox,*[data-role=lightbox]','click',function(e){
      //阻止事件冒泡
      e.stopPropagation();
      var curGroupName = $(this).attr('data-group');
      if(curGroupName != self.groupName){
        self.groupName = curGroupName;
        //根据当前组名，获取一组数据
        self.getGroup();
      }
      self.initPopup($(this));
    });
    //关闭弹窗
    this.popupMask.click(function(){
      $(this).fadeOut();
      self.popupWindow.fadeOut();
    });
    this.closeBtn.click(function(){
      self.popupMask.fadeOut();
      self.popupWindow.fadeOut();
    });
    //绑定上下切换按钮事件
    this.flag = true;
    this.nextBtn.hover(function(){
                        if(!$(this).hasClass('dis') && self.groupData.length>1){
                          $(this).addClass('show');
                        }
                      },function(){
                        if(!$(this).hasClass('dis') && self.groupData.length>1){
                          $(this).removeClass('show');
                        }
                      }).click(function(e){
                        e.stopPropagation();
                        if(!$(this).hasClass('dis') && self.flag){
                          self.flag = false;
                          self.goto('next');
                        }
                      });
    this.prevBtn.hover(function(){
                        if(!$(this).hasClass('dis') && self.groupData.length>1){
                          $(this).addClass('show');
                        }
                      },function(){
                        if(!$(this).hasClass('dis') && self.groupData.length>1){
                          $(this).removeClass('show');
                        }
                      }).click(function(e){
                        e.stopPropagation();
                        if(!$(this).hasClass('dis') && self.flag){
                          self.flag = false;
                          self.goto('prev');
                        }
                      });
  }
  Lightbox.prototype = {
    goto:function(dir){
      if(dir === 'next'){
        this.index++;
        if(this.index >= this.groupData.length-1){
          this.nextBtn.addClass('dis').removeClass('show');
        }
        if(this.index != 0){
          this.prevBtn.removeClass('dis');
        }
        var src = this.groupData[this.index].src;
        this.loadPic(src);
      }else if(dir === 'prev'){
        this.index--;
        if(this.index <= 0){
          this.prevBtn.addClass('dis').removeClass('show');
        }
        if(this.index != this.groupData.length-1){
          this.nextBtn.removeClass('dis');
        }
        var src = this.groupData[this.index].src;
        this.loadPic(src);
      }
    },
    loadPic:function(sourceSrc){
      var self = this;
      self.popupPic.css({
                        width:'auto',
                        height:'auto'
                        }).hide();
      this.preLoadImg(sourceSrc,function(){
        self.popupPic.attr('src',sourceSrc);
        var picWidth = self.popupPic.width(),
            picHeight = self.popupPic.height();
        self.changePic(picWidth,picHeight);
      });
    },
    changePic:function(picWidth,picHeight){
      var self =this,
          winWidth = $(window).width(),
          winHeight = $(window).height();
      //如果图片的宽高大于浏览器视口宽高比例，
      var scale = Math.min(winWidth/(picWidth+10),winHeight/(picHeight+10),1);
      picWidth = picWidth*scale;
      picHeight = picHeight*scale;
      this.picViewArea.animate({
                                width:picWidth-10,
                                height:picHeight-10
                              });
      this.popupWindow.animate({
                                  width:picWidth,
                                  height:picHeight,
                                  marginLeft:-picWidth/2,
                                  top:(winHeight-picHeight)/2
                                },function(){
                                  self.popupPic.css({
                                    width:picWidth-10,
                                    height:picHeight-10
                                  }).fadeIn();
                                  self.picCaption.fadeIn();
                                  self.flag = true;
                                });
      this.captionText.text(this.groupData[this.index].caption);
      this.curIndex.text('当前索引：'+(this.index+1)+' of '+this.groupData.length);
    },
    preLoadImg:function(sourceSrc,callback){
      var img = new Image();
      if(!!window.ActiveXObject){
        img.onreadystatechange = function(){
          if(this.readyState == 'complete'){
            callback();
          }
        }
      }else{
        img.onload = function(){
          callback();
        }
      }
      img.src = sourceSrc;
    },
    initPopup:function(curObj){
      var self = this,
          sourceSrc = curObj.attr('data-source'),
          curId = curObj.attr('data-id');
      this.showMaskPopup(sourceSrc,curId);
    },
    showMaskPopup:function(sourceSrc,curId){
      var self =this;
      this.popupPic.hide();
      this.picCaption.hide();
      this.popupMask.fadeIn();
      var winWidth = $(window).width(),
          winHeight = $(window).height();
      this.picViewArea.css({
        width:winWidth/2,
        height:winHeight/2
      });
      this.popupWindow.fadeIn();
      var viewHeight =winHeight/2+10;
      this.popupWindow.css({
                            width:winWidth/2+10,
                            height:viewHeight,
                            marginLeft:-(winWidth/2+10)/2,
                            top:-viewHeight
                          }).animate({
                                      top:(winHeight-viewHeight)/2
                                    },function(){
                                      self.loadPic(sourceSrc);
                                    })
      //根据当前点击的元素 ID 获取在当前组别的索引
      this.index = this.getIndexOf(curId);
      var groupDataLen = this.groupData.length;
      if(groupDataLen > 1){
        if(this.index === 0){
          this.prevBtn.addClass('dis');
          this.nextBtn.removeClass('dis');
        }else if(this.index === groupDataLen-1){
          this.prevBtn.removeClass('dis');
          this.nextBtn.addClass('dis');
        }else{
          this.prevBtn.removeClass('dis');
          this.nextBtn.removeClass('dis');
        }
      }
    },
    getIndexOf:function(curId){
      var index =0;
      $(this.groupData).each(function(i){
        index=i;
        if(this.id === curId){
          return false;
        }
      });
      return index;
    },
    getGroup:function(){
      var self = this;
      //根据当前组别名称，获取页面中所有组别相同的对象
      var groupList = this.bodyNode.find('*[data-group='+this.groupName+']');
      //清空数组对象
      self.groupData.length = 0;
      groupList.each(function(){
        self.groupData.push({src:$(this).attr('data-source'),
                             id:$(this).attr('data-id'),
                             caption:$(this).attr('data-caption')
        });
      });
    },
    renderDOM:function(){
      var strDom ='<div class="view">'+
                    '<span class="btn prev"></span>'+
                    '<img class="pic" src="image/1.jpg">'+
                    '<span class="btn next"></span>'+
                  '</div>'+
                  '<div class="caption">'+
                    '<div class="content">'+
                      '<p class="desc"></p>'+
                      '<p class="index">当前索引：0/0</p>'+
                    '</div>'+
                    '<span class="close"></span>'+
                 '</div>';
      //插入到弹出层
      this.popupWindow.html(strDom);
      //把遮罩和弹出框插入body
      this.bodyNode.append(this.popupMask,this.popupWindow);
    }
  }
  window['Lightbox'] = Lightbox;
})