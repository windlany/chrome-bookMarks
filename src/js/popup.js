$(document).ready(function () { 
    var marks = []; // 书签栏数据

    // 递归遍历所有书签
    function showMarks(node) {  
        var html = "";
        if(!node)
            reutrn; 

        if(node.children) { 
            html += showFiles(node); // 展示文件夹
            for(var i in node.children) {
                html += showMarks(node.children[i]);
            }
            html += '</li></ul>';
        } else { 
            html += showFile(node); // 展示文件
        } 
        return html;
    }

    // 展示文件夹
    function showFiles(node) {  
        var html = "";
        if(node.title)
            html = `<li><ul id=${node.id}><div class="files"><i class="first fa fa-folder"></i><span>${node.title}(${node.children.length})</span><i class="add optionBtn fa fa-plus"></i><i class="edit optionBtn fa fa-edit"></i><i class="delete optionBtn fa fa-trash"></i></div>`;
        if(node.title == "书签栏" || node.title == "其他书签")
            html = `<li><ul><div class="files"><i class="first fa fa-folder fa-folder-open"></i><span>${node.title}(${node.children.length})</span><i class="add optionBtn fa fa-plus"></i><i class="edit optionBtn fa fa-edit"></i><i class="delete optionBtn fa fa-trash"></i></div>`;
        return html;
    }
    // 展示文件
    function showFile(node) {
        var html = `<li class="file"><a href='${node.url}' id='${node.id}'><i class="fa fa-file-o"></i><span>${node.title}</span></a><i class="edit optionBtn fa fa-edit"></i><i class="delete optionBtn fa fa-trash"></i></li>`;
        return html;
    } 

    function refresh() {
        chrome.bookmarks.getTree(function(bookmarks) {
            $('#bookmarks').html(showMarks(bookmarks[0])); 
            marks = bookmarks[0];
        });
    }

	var init = function(){
        // 按照层次结构获取所有书签
		chrome.bookmarks.getTree(function(bookmarks) {
            $('#bookmarks').html(showMarks(bookmarks[0])); 
            marks = bookmarks[0];
        });

        // 点击文件夹显示文件
	    $("#bookmarks").on('click','.files', function(){
	    	var $li = $(this).siblings('li');
	    	if($li.is(":hidden")){
                $li.show();
                $(this).children('i.first').addClass('fa-folder-open');
	    	}else{
                $li.hide();
                $(this).children('i.first').removeClass('fa-folder-open');
	    	}
	    });

        // 点击文件跳转页面
	    $("#bookmarks").on('click','a', function(){
	    	var url = $(this).attr('href');
	    	chrome.tabs.create({url: url});  // 跳转页面
        });  
        
        // 删除书签
	    $("#bookmarks").on('click','.delete', function(){
            // 根据id删除书签
            var id = '';
            if($(this).parent().attr('class') == 'file') {
                id = $(this).siblings('a').attr('id');
                chrome.bookmarks.remove(String(id));
                $(this).parent().remove();  // 移除对应li
            } else { // 删除文件夹
                id = $(this).parent().parent().attr('id');
                chrome.bookmarks.removeTree(String(id));
                $(this).parent().parent().parent().remove();   
            }
        });
        
        // 添加文件夹
        $("#bookmarks").on('click','.add', function(){
            event.stopPropagation();
            var id = $(this).parent().parent().attr('id');
            var title = prompt("请输入文件夹名称：","新建文件夹");
            chrome.bookmarks.create({
                'parentId': id,
                'title': title
            });
            refresh();
        });

        // 修改书签名称
        $("#bookmarks").on('click','.edit', function(){
            var id = '';

            if($(this).parent().attr("class") == 'file') {
                id = $(this).siblings('a').attr('id'); 
            } else {  
                id = $(this).parent().parent().attr('id');   
            }

            var title = prompt("请输入新名称：", "");
            chrome.bookmarks.update(id, {
                title: title
            });

            if($(this).parent().attr("class") == 'file') {
                id = $(this).siblings('a').children('span').html(title);
            } else {  
                id = $(this).siblings('span').html(title);
            }
        });

        // 查询书签
	    $("input.search").keyup(function(e){
            var key = $(this).val();
            if(key){
                chrome.bookmarks.search(key, function(bookmarks){
                    var html = "";
                    bookmarks.forEach(function(mark){
                        html += showFile(mark);
                    });
                    $('#bookmarks').html(html);
                })
            } else {
                $('#bookmarks').html(showMarks(marks)); 
            }
	    });
	}

	init();
});