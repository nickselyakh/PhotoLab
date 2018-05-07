function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min));
}

let tags = ['house', 'minimalism', 'roof', 'monaco', 'life'];

function generatePosts(number) {
    let posts = [];
    for (let id = 0; id < number; id++) {
        let post = {};
        post.id = id.toString();
        post.description = 'description for id ' + id;
        post.createdAt = new Date('2018-03-05T12:00:00');
        post.author = 'Author ' + id;
        post.photoLink = 'http://photoLab.com/' + id + '.jpg';
        let likes = [];
        for (let j = 0; j < 5; j++) {
            likes.push('Author ' + randomInt(0, number));
        }
        post.likes = likes;
        post.hashTags = [tags[id % tags.length], tags[(id + 1) % tags.length]];

        posts.push(post);
    }

    return posts;
}

let photoPosts = generatePosts(40).sort((a, b) => {
    return b.createdAt - a.createdAt
});


let postsModule = (function (photoPosts) {
    let self = {};

    self.getPhotoPosts = function (skip = 0, top = 10, filterConfig = null) {
        if (typeof skip !== 'number' || typeof top !== 'number' || typeof filterConfig !== 'object') {
            return [];
        }

        let posts = photoPosts;
        if (filterConfig) {
            posts = posts.filter(function (item) {
                if ((filterConfig.author && item.author !== filterConfig.author) ||
                    (filterConfig.date && item.createdAt.getTime() !== filterConfig.date.getTime())) {
                    return false;
                }

                if (filterConfig.tags) {
                    if (!filterConfig.tags.every(function (tag) {
                            return item.hashTags.includes(tag);
                        })) {
                        return false;
                    }
                }
                return true;
            });
        }

        top = Math.min(skip + top, photoPosts.length);
        return posts.slice(skip, top);
    };

    self.getPhotoPost = function (id) {
        if (!id || typeof id !== 'string') {
            return undefined;
        }
        return photoPosts.find(function (item) {
            return item.id === id;
        });
    };


    self.validatePhotoPost = function (photoPost) {
        let validator = {
            id: function (id) {
                return typeof id === 'string'
            },
            description: function (description) {
                return (typeof description === 'string' && description.length > 0 && description.length <= 200)
            },
            createdAt: function (createdAt) {
                return createdAt instanceof Date
            },
            author: function (author) {
                return (typeof author === 'string' && author.length !== 0)
            },
            photoLink: function (photoLink) {
                return (typeof photoLink === 'string' && photoLink.length !== 0)
            },
            likes: function (likes) {
                return Array.isArray(likes)
            },
            hashTags: function (hashTags) {
                return Array.isArray(hashTags)
            }
        };

        return Object.keys(validator).every(key => {
            return validator[key](photoPost[key]);

        });
    };


    self.addPhotoPost = function (photoPost) {
        if (!photoPost || typeof photoPost !== 'object') {
            return false;
        }
        if (!self.validatePhotoPost(photoPost)) {
            return false;
        } else {
            photoPosts.push(photoPost);
            photoPosts = photoPosts.sort((a, b) => {
                return b.createdAt - a.createdAt
            });
            return true;
        }
    };

    self.editPhotoPost = function (id, photoPost) {
        if (typeof id !== 'string' || !photoPost || typeof photoPost !== 'object') {
            return false;
        }
        let post = self.getPhotoPost(id);
        if (post === undefined) {
            return false;
        }
        delete photoPost.id;
        delete photoPost.author;
        delete photoPost.createdAt;
        let newPost = Object.assign({}, post);
        newPost = Object.assign(newPost, photoPost);

        if (!self.validatePhotoPost(newPost)) {
            return false;
        }
        Object.assign(post, newPost);
        return true;
    };


    self.removePhotoPost = function (id) {
        if (typeof id !== 'string') {
            return false;
        }
        let index = photoPosts.findIndex(function (item) {
            return item.id === id;
        });
        if (index === -1) {
            return false;
        }
        photoPosts.splice(index, 1);
        return true;
    };

    return self;

})(photoPosts);

let userName = 'sds';

let domModule = (function () {
    let self = {};

    self.displayPosts = function (posts) {
        document.getElementById('posts');
        for (let i = 0; i < posts.length - 1; i++) {
            self.displayPost(posts[i]);
        }
    };

    self.displayPost = function (post) {
        let container = document.getElementById('posts');
        container.insertBefore(self.getPostHTML(post), container.firstElementChild);
    };

    self.getPostHTML = function getPostHTML(post) {
        let div = document.createElement('div');
        div.className += 'card'
        div.id = `post-${post.id}`;
        div.innerHTML = `
        <div class="card-header">
            <div><img src="${post.photoLink}" class="profile-img"></div>
            <div class="name">
                <div>${post.author.toUpperCase()}</div>
                <span class="data">${post.createdAt.toLocaleDateString()}</span>
            </div>
        </div>
        ${userName ? `
        <div class = "options padd">
        <div class="dropdown">
<a class="dropbtn" onclick="editPhoto(${post.id})">...</a>
  <div id="myDropdown-${post.id}" class="dropdown-content" >
    <a href="#edit">Edit</a>
    <a href="#delete">Delete</a>
  </div>
</div>
</div>` : ''}
        
        </div>
        <div class="content">
            <img src="./img/minimalism.jpg">
        </div>

        <div class="description">
              ${post.description}
        </div>

        <hr>

        <div class="likes">
            ${post.likes.length} likes
        </div>
        <div class="heart">
           &hearts;
        </div>
         <div class="tegs">${post.hashTags.map(p => '#' + p).join(' ')}</div>

        `;
        return div;
    };
    self.editPhotoPost = function (id, post) {
        const postElem = document.getElementById(`post-${id}`);
        if (postElem) {
            document.getElementById('posts').replaceChild(self.getPostHTML(post), postElem);
        }
    };
    self.removePhotoPost = function (id) {
        const childNode = document.getElementById(`post-${id}`);
        if (childNode) {
            document.getElementById('posts').removeChild(childNode);
        }
    };
    self.displayHeader = function () {
        let ul = document.getElementById('right').firstElementChild;
        ul.innerHTML = `${userName ? `<li><a href="#username" class="username">${userName} |</a></li>
                <li><div class="add" onclick="myFunc()">+</div></li>` :
            `<li><a href = "#" onclick="document.getElementById('id01').style.display='block'" class="add">Sign in</a></li>

<div id="id01" class="modal">
    <span onclick="document.getElementById('id01').style.display='none'" class="close" title="Close Modal">&times;</span>
    <form class="modal-content">
        <div class="container">
            <h1 class ="add">Sign in</h1>
            <hr>
            <label>Name</label>
            <input type="text" placeholder="Enter name" name="name" required>

            <label>Password</label>
            <input type="password" placeholder="Enter password" name="psw" required>

            <div class="clearfix">
                <button type="button" onclick="document.getElementById('id01').style.display='none'" class="cancelbtn">Cancel</button>
                <button type="submit" class="signupbtn">Sign in</button>
            </div>
        </div>
    </form>
</div>


`}`;
    };
    return self;
})();

function displayAllPosts() {
    domModule.displayPosts(postsModule.getPhotoPosts(0, 10));
}
function addPost(post) {
    if (dataModule.addPhotoPost(post)) {
        domModule.displayPost(post);
    }
}
function removePhotoPost(id) {
    if (dataModule.removePhotoPost(id)) {
        domModule.removePhotoPost(id);
        return true;
    }
    return false;
}
function editPhotoPost(id, post) {
    if (dataModule.editPhotoPost(id, post)) {
        domModule.editPhotoPost(id, dataModule.getPhotoPost(id));
    }
}
function displayHeader() {
    domModule.displayHeader();
}

function load() {
    events.loadMore();
}

function authorizationForm() {
    let modal = document.getElementById('id01');
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

}
function editPhoto(id) {
    let $option = document.getElementById(`post-${id}`).querySelector(`#myDropdown-${id}`);
        $option.classList.toggle("show");

}


displayHeader();
displayAllPosts();


let loadMore = (function (window, undefined) {
    let i = 0;
    let button = document.getElementById('load')
        .addEventListener(
            'click',
            function () {
                i += 10;
                domModule.displayPosts(postsModule.getPhotoPosts(i, 10,));
            }
        );
})(window, undefined)
let name;
let filtr = (function (window, undefined) {

        let input = document.getElementById("name");
        input.addEventListener('change', function () {
            name = input.textContent;
            console.log(name);
        });
    })(window, undefined);

window.onload = function () {
    authorizationForm();
}