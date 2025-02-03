const siteMainLi = document.querySelectorAll('.site-main-li');
let bookArr = [{
    "id": "all",
    "name": "综合",
    "icon": "mu"
}];

siteMainLi.forEach((item) => {
    // 获取item孩子中标题信息 id name icon
    let siteTit = item.querySelector('.site-tit');
    let id = siteTit.id;
    let name = siteTit.innerText;
    let icon = siteTit.querySelector('i').className; // 假设图标类名在 <i> 标签中

    let books = [];
    // 遍历链接
    item.querySelector('.site-list').querySelectorAll('.siteList').forEach((child) => {
        let titleAndDescription = child.querySelector('.title').innerText;
        let title = "", description = "";

        // 处理不同格式的标题和描述
        if (titleAndDescription.includes('-')) {
            let parts = titleAndDescription.split('-');
            title = parts[0].trim();
            description = parts[1].trim();
        } else if (titleAndDescription.includes('——')) {
            let parts = titleAndDescription.split('——');
            title = parts[0].trim();
            description = parts[1].trim();
        } else if (titleAndDescription.includes('|')) {
            let parts = titleAndDescription.split('|');
            title = parts[0].trim();
            description = parts[1].trim();
        } else if (titleAndDescription.includes('丨')) {
            let parts = titleAndDescription.split('丨');
            title = parts[0].trim();
            description = parts[1].trim();
        } else if (titleAndDescription.includes('(') && titleAndDescription.includes(')')) {
            let parts = titleAndDescription.split('(');
            title = parts[0].trim();
            description = parts[1].split(')')[0].trim();
        } else {
            title = titleAndDescription.trim();
            description = "";
        }

        let book = {
            "id": child.getAttribute('data-id'),
            "title": title,
            "avatar": child.querySelector('.icon').src,
            "description": description,
            "links": child.getAttribute('data-links')
        };
        books.push(book);
    });

    bookArr.push({
        "id": id,
        "name": name,
        "icon": icon,
        "books": books
    });
});

console.log(bookArr);
