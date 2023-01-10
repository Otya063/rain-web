<!-- <form class="search" action="">
  <input type="search" name="keywords" placeholder="検索" value="">
  <button></button>
</form> -->
<ul class="categories">
    <li id="toppage" class="category">
        <button class="category_title" type="button"><span class="mark"></span>Home</button>
        <ul class="sub_categories">
            <dl class="sub_categories_list">
                <li id="home" class="sub_category" onclick="loadArticle()">Home</li>
                <li id="news" class="sub_category" onclick="loadArticle('news/')">Update History</li>
            </dl>
        </ul>
    </li>
    <li id="entry" class="category">
        <button class="category_title" type="button"><span class="mark"></span>Sign Up</button>
        <ul class="sub_categories">
            <dl class="sub_categories_list">
                <li id="acccreate" class="sub_category" onclick="loadArticle('entry/', 'acccreate/')">Account Creation Procedure</li>
                <li id="acclink" class="sub_category" onclick="loadArticle('entry/', 'acclink/')">Discord Account Linking</li>
            </dl>
        </ul>
    </li>
    <li class="category">
        <button class="category_title" type="button"><span class="mark"></span>Starting the Game</button>
        <ul class="sub_categories">
            <dl class="sub_categories_list">
                <li class="sub_category">How to Start the Game</li>
                <li class="sub_category">Title Menu</li>
                <li class="sub_category">Character Creation</li>
                <li class="sub_category">Adding and Deleting Characters</li>
                <li class="sub_category">World Selection</li>
                <li class="sub_category">Tutorial</li>
                <li class="sub_category">Multiple Launch of the Game</li>
                <li class="sub_category">Quit the Game</li>
            </dl>
        </ul>
    </li>
</ul>