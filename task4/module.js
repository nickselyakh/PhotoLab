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

let photoPosts = generatePosts(20);

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

        return !(typeof photoPost.id !== 'string' ||
        typeof photoPost.description !== 'string' ||
        typeof photoPost.author !== 'string' || photoPost.author.length === 0 ||
        typeof photoPost.photoLink !== 'string' || photoPost.photoLink.length === 0 ||
        !photoPost.createdAt || !(photoPost.createdAt instanceof Date) ||
        photoPost.description.length >= 200 ||
        !Array.isArray(photoPost.likes) || !Array.isArray(photoPost.hashTags));

    };

    self.addPhotoPost = function (photoPost) {
        if (!photoPost || typeof photoPost !== 'object') {
            return false;
        }
        if (self.validatePhotoPost(photoPost)) {
            photoPosts.push(photoPost);
            return true;
        } else {
            return false;
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

function tests() {
    console.log('\n    getPhotoPosts');
    console.log('get first post');
    console.log(postsModule.getPhotoPosts(0, 1));
    console.log('get first 10 posts');
    console.log(postsModule.getPhotoPosts(0, 10));
    console.log('get all posts of "Author 0"');
    console.log(postsModule.getPhotoPosts(0, photoPosts.length, {author: 'Author 0'}));
    console.log('get first post with date ' + new Date('2018-03-05T12:00:00'));
    console.log(postsModule.getPhotoPosts(0, 1, {date: new Date('2018-03-05T12:00:00')}));
    console.log('get first post with tag "minimalism"');
    console.log(postsModule.getPhotoPosts(0, 1, {tags: ['minimalism']}));
    console.log('get invalid post');
    console.log(postsModule.getPhotoPost('invalid id'));

    console.log('\n    postValidator');
    let post = Object.assign({}, photoPosts[0]);
    console.log('valid post');
    console.log(postsModule.validatePhotoPost(post));
    post.id = 111;
    console.log('invalid id');
    console.log(postsModule.validatePhotoPost(post));
    post.id = '1';
    post.description = 123;
    console.log('invalid description');
    console.log(postsModule.validatePhotoPost(post));
    post.description = 'desc';
    post.author = '';
    console.log('empty author');
    console.log(postsModule.validatePhotoPost(post));
    post.author = 'nicky';
    post.createdAt = '12:00';
    console.log('invalid creation date');
    console.log(postsModule.validatePhotoPost(post));
    post.createdAt = new Date;
    post.photoLink = '';
    console.log('invalid photo link');
    console.log(postsModule.validatePhotoPost(post));

    console.log('\n    addPost');
    let newPost = Object.assign({}, photoPosts[0]);
    newPost.id = '-1';
    console.log('valid post');
    console.log(postsModule.addPhotoPost(newPost));
    delete newPost.author;
    console.log('invalid post');
    console.log(postsModule.addPhotoPost(newPost));

    console.log('\n    editPhotoPost');
    let newDesc = photoPosts[0].description + "!";
    console.log('edit first post description');
    console.log(postsModule.editPhotoPost(photoPosts[0].id, {description: newDesc}));
    console.log('edit invalid post');
    console.log(postsModule.editPhotoPost('invalid id', {description: 'new description'}));
    console.log('edit to make it invalid');
    console.log(postsModule.editPhotoPost(photoPosts[0].id, {description: undefined}));

    console.log('\n    removePhotoPost');
    let id = photoPosts[0].id;
    console.log('remove first post');
    console.log(postsModule.removePhotoPost(id));
    console.log('get removed post');
    console.log(postsModule.getPhotoPost(id));
    console.log('remove invalid post');
    console.log(postsModule.removePhotoPost('invalid id'));


}
tests();