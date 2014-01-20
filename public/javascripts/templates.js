window.JST = {}

JST["defaultView"] = _.template("\
        <h1>No App specified or No Such App in Record</h1> \
        <p>Add One</p> \
        <button class='add-package'>Add Package</button>\
        <p>Or choose from any below</p> \
        <% _.each(packages, function(package){ %> \
            <button class='package' data-package=\'<%= package.package_name %>\'> \
            <%= package.package_name %></button> \
        <% }) %> \
    ")

JST["graphView"] = _.template("\
        <button>Back to Apps</button> \
        <svg></svg> \
    ");

JST["allPackagesView"] = _.template("\
    <% _.each(packages, function(package){ %> \
        <div> \
            <strong><%= package.package_name%></strong> \
            <span>| keywords: </span> \
            <% _.each(package.keywords, function(keyword) { %> \
                <strong> - <%= keyword %></strong> \
            <% }) %> \
            <button id=\'<%=package.package_name %>\' data-id=\'<%= package._id %>\'class='edit-package'>Edit Package</button> \
            <button id=\'<%=package._id %>\'class='remove-package'>Remove Package</button> \
        </div> \
    <% }) %> \
    ");

JST["noDataView"] = _.template("\
        <button>Back to Apps</button> \
        <h1> No Data for this Package Yet </h1> \
    ");

JST["savePackageButton"] = _.template("\
        <button class='save-package'>save Package</button> \
    ");
JST["addPackageView"] = _.template("\
    <div id='add-package-form'> \
        <span>Package Name: </span> \
        <input type='text' id='package-name'> \
        <span> \
            Keywords \
            <small>(Separate by comma)</small> \
            : \
        </span> \
        <input type='text' id='package-keywords'> \
        <button class='add-package'>Add Package</button> \
    </div> \
    <br> \
    ");

JST["addPackageHeaderView"] = _.template("\
    <button class='apps-index'>Back to Apps</button> \
    <h1>Add a Package</h1> \
    ");
