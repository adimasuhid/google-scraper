window.JST = {}

JST["defaultView"] = _.template("\
        <h1>No App specified or No Such App in Record</h1> \
        <p>Choose from any below</p> \
        <% _.each(packages, function(package){ %> \
            <button data-package=\'<%= package.package_name %>\'> \
            <%= package.package_name %></button> \
        <% }) %> \
    ")

JST["graphView"] = _.template("\
        <button>Back to Apps</button> \
        <svg></svg> \
    ");
