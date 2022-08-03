window.draw = (input) => {
    if(document) document.getElementById('loading').style.display = 'none'; 
    return input.filter(a=>a.data?.image).map(props => `
    <div class="max-w-sm m-8 bg-white rounded-lg shadow-md bg-white shadow-lg sm:rounded-3xl sm:bg-clip-padding bg-opacity-60 border border-gray-200" style="backdrop-filter: blur(20px); rounded-3xl m-5">
    <a href="https://${props.data.link || props.data.git}">
        <img class="rounded-t-lg" src="${props.data.image || props.data['file-upload']}" alt="product image" />
    </a>
    <div class="px-5 pb-5">
        <span id="project" class="hidden">${props.data.project}</span>
        <b><h1 id="title" class="w-full text-center mb-2">${props.data.title}</h1></b>
        <b class="ml-5 mt-10">Public link:</b>
        <div class="m-5 mt-2 text-blue-600" id="git"><a class="break-words" href="https://${props.data.link || props.data.git}">https://${props.data.link || props.data.git}</a></div>
        <b class="ml-5 mt-10">Author:</b>
        <div class="m-5 mt-2" id="author">${props.data.author}</div>
        <b class="ml-5 mt-10">Excerpt:</b>
        <div class="m-5 mt-2" id="excerpt">${props.data.excerpt}</div>
        <b class="ml-5 mt-10">Description:</b>
        <div class="ml-5 mr-5 mb-10" id="description">${props.data.description}</div>
    </div>
</div>
    `).join('')
};
