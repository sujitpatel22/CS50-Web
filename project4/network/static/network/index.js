document.addEventListener('DOMContentLoaded', function () {

    document.querySelector('#home').addEventListener('click', () => load_posts('default'));
    document.querySelector('#profile_btn').addEventListener('click', () => load_profile(0, 'self'));
    document.querySelector('#new_post').addEventListener('click', () => write_post('new'));
    document.querySelector('#posts_btn').addEventListener('click', () => load_posts('default'));
    document.querySelector('#flwing_btn').addEventListener('click', () => load_posts('following'));
    document.querySelector('#blocklist_btn').addEventListener('click', () => load_blocklist());

    load_posts('default');
});


function load_profile(get_user_id, option) {
    document.querySelectorAll('.views').forEach(div => {
        div.style.display = "none";
    });
    user_profile = document.querySelector('#profile_view');
    user_profile.style.display = 'flex';
    document.querySelector('#posts_view').style.display = "block";
    document.querySelector('#posts_view').innerHTML = "";

    fetch(`/profile/${get_user_id}/${option}`)
        .then(response => response.json())
        .then(info => {
            console.log(info);
            document.querySelector('.username').innerHTML = `Username: ${info["username"]}`;
            document.querySelector('.email').innerHTML = `Email: ${info["email"]}`;
            document.querySelector('.followers').innerHTML = `Followers ${info["followers"]}`;
            document.querySelector('.following').innerHTML = `Following ${info["following"]}`;

            follow_btn = document.querySelector('.follow_btn');
            block_btn = document.querySelector('.block_btn');
            if (info["user_loged"] == info["user"]) {
                document.querySelector('.user_action').style.display = "none";
            }
            else{
                document.querySelector('.user_action').style.display = "block";
            }
            if (info["is_connected"] == true) {
                follow_btn.innerHTML = "Unfollow";
            }
            else if (info["is_connected"] == false) {
                follow_btn.innerHTML = "Follow";
            }
            if (info["blocked"] == true) {
                block_btn.innerHTML = "Unblock";
            }
            else if (info["blocked"] == false) {
                block_btn.innerHTML = "Block";
            }
            follow_btn.addEventListener('click', () => update_profile(info["user"], 'follow'));
            block_btn.addEventListener('click', () => update_profile(info["user"], 'block'));

        })
        .then(load_posts(get_user_id))
        .catch(error => console.log(error));
}


function update_profile(get_user_id, option) {
    fetch(`/profile/${get_user_id}/${option}`, {
        method: "PUT"
    })
        .then(response => response.json())
        .then(info =>{
            if (option == "follow"){
                document.querySelector('.followers').innerHTML = `Followers ${info["followers"]}`;
                document.querySelector('.following').innerHTML = `Following ${info["following"]}`;
            }
            if (info["is_connected"] == true) {
                follow_btn.innerHTML = "Unfollow";
            }
            else if (info["is_connected"] == false) {
                follow_btn.innerHTML = "Follow";
            }
            if (info["blocked"] == true) {
                block_btn.innerHTML = "Unblock";
            }
            else if (info["blocked"] == false) {
                block_btn.innerHTML = "Block";
            }
        })
        .catch(error => console.log(error));
}


function write_post(option) {
    document.querySelectorAll('.views').forEach(div => {
        div.style.display = "none";
    });
    document.querySelector('#write_view').style.display = "block";
    document.querySelector('#write_form').addEventListener('submit', send_post);
}

function send_post() {
    fetch('/post', {
        method: "POST",
        body: JSON.stringify({
            text: document.querySelector('#write_body').value
        })
    })
        .then(response => response.json())
        .then(message => console.log(message))
        .then(load_posts('default'))
        .catch(error => console.log(error));
}


function load_posts(option) {
    document.querySelectorAll('.views').forEach(div => {
        div.style.display = "none";
    });
    document.querySelector('#write_btn').style.display = "block";
    if (option != "default" && option != "following") {
        document.querySelector('#write_btn').style.display = "none";
        document.querySelector('#profile_view').style.display = "flex";
    }
    posts_view = document.querySelector('#posts_view');
    posts_view.innerHTML = "";
    posts_view.style.display = "block";

    fetch(`/posts/${option}`)
        .then(response => response.json())
        .then(posts => {
            console.log(posts);
            posts_view.innerHTML = `<h4 style="margin: 15px;">Latest posts</h4> <hr>`;
            posts.forEach(post => {
                new_post = document.createElement('div')
                new_post.id = `${post["user"]}_post${post["id"]}`;
                new_post.className = `post post${post["id"]}`;
                new_post.innerHTML =
                `<h5 class="post${post["id"]}_${post["username"]}">@${post["username"]}</h5>
                <div class="post${post["id"]}_content">${post["content"]}</div>
                <p class="post${post["id"]}_datetime">${post["date_time"]}</p>`;
                posts_view.append(new_post);

                action_bar = document.createElement('div');
                action_bar.className = `action_bar action_bar${post["id"]}`;
                new_post.append(action_bar);
                action_bar.innerHTML =
                `<img class="like_post${post["id"]}" src="./static/network/like.png" alt="like" height="20px" width="22px">  <span class="post${post["id"]}like_value"></span>
                <img class="dislike_post${post["id"]}" src="./static/network/dislike.png" alt="dislike" height="20px" width="22px">  <span class="post${post["id"]}dislike_value"></span>`;

                document.querySelector(`.post${post["id"]}like_value`).innerHTML = `${[post["likes"]]}`;
                document.querySelector(`.post${post["id"]}dislike_value`).innerHTML = `${[post["dislikes"]]}`;

                edit_btn = document.createElement('button');
                edit_btn.className = `edit_btn edit_${post["id"]}`;
                if (post["editable"]) {
                    edit_btn.innerHTML = "Edit";
                    action_bar.append(edit_btn);
                    document.querySelector(`.edit_${post["id"]}`).addEventListener('click', () => {
                        document.querySelector(`.edit_${post["id"]}`).style.display="none";
                        update_post_text(post, 'edit');
                    });
                }

                document.querySelector(`.post${post["id"]}_${post["username"]}`).addEventListener('click', () => load_profile(post["user"], "other"));
                document.querySelector(`.like_post${post["id"]}`).addEventListener('click', () => {
                    update_post(post, 'likes');
                });
                document.querySelector(`.dislike_post${post["id"]}`).addEventListener('click', () => {
                    update_post(post, 'dislikes');
                });
            })
        })
        .catch(error => console.log(error));
}

function update_post_text(get_post, option) {
    if (option == "edit") {
        document.querySelector(`.post${get_post["id"]}_content`).innerHTML =
        `<form class="edit_post_form" onsubmit="return false">
        <textArea id="edit_post" class="form-control" required placeholder="${get_post["content"]}"></textArea>
        <input type = "submit" class="edit_btn edit_submit_btn" value="Update">
        </form>`;
        document.querySelector('.edit_post_form').addEventListener('submit', function (){
            update_post_text(get_post, 'save');
        });
    }
    else if (option == "save") {
        fetch(`/post/${get_post["id"]}/${option}`, {
            method: "PUT",
            body: JSON.stringify({
                get_user_id: get_post["user"],
                content: document.querySelector('#edit_post').value
            })
        })
            .then(response => response.json())
            .then(post => {
                console.log(post)
                document.querySelector(`.post${get_post["id"]}_content`).innerHTML = `${post["content"]}`;
                document.querySelector(`.post${get_post["id"]}_datetime`).innerHTML = `${post["date_time"]}`;
                document.querySelector(`.edit_${get_post["id"]}`).style.display="block";
            })
            .catch(error => console.log(error));
    }
}
function update_post(post, option) {
    fetch(`/post/${post["id"]}/${option}`, {
        method: "PUT",
        body: JSON.stringify({
            get_user_id: post["user"]
        })
    })
        .then(response => response.json())
        .then(post => {
            if (option == "likes") {
                document.querySelector(`.post${post["id"]}like_value`).innerHTML = `${[post["likes"]]}`;
            }
            else if (option == "dislikes") {
                document.querySelector(`.post${post["id"]}dislike_value`).innerHTML = `${[post["dislikes"]]}`;
            }
        })
        .catch(error => console.log(error));
}

function load_blocklist()
{
    document.querySelectorAll('.views').forEach(div => {
        div.style.display = "none";
    });
    posts_view = document.querySelector('#posts_view');
    posts_view.innerHTML = "";
    posts_view.style.display = "block";

    fetch('/posts/blocklist')
        .then(response => response.json())
        .then(blocks => {
            console.log(blocks);
            posts_view.innerHTML = `<h4 style="margin: 15px;">Blocklist</h4> <hr>`;
            blocks.forEach(block => {
            new_item = document.createElement('div');
            new_item.id = `block_${block["user_id"]}`;
            new_item.className = `blocks post block_${block["user_id"]}`;
            new_item.innerHTML =`${block["username"]}`;
            posts_view.append(new_item);

            document.querySelector(`#block_${block["user_id"]}`).addEventListener('click', () => load_profile(block["user_id"], 'other'));
        })
    })
    .catch(error => {
        console.log(error);
        posts_view.innerHTML = `<h4 style="margin: 15px;">Empty Blocklist</h4>`;
    });
}