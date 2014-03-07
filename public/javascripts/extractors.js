$(document).ready(function() {

    $("div.xtrc-select-message").sampleMessageLoader({
        subcontainer: $('div.subcontainer', $('div.xtrc-select-message')),
        selector: $('div.manual-selector', $('div.xtrc-select-message')),
        message: $('div.xtrc-message', $('div.xtrc-select-message')),
        spinner: $('div.spinner', $('div.xtrc-select-message')),
        recentButton: $('button.xtrc-load-recent', $('div.subcontainer', $('div.xtrc-select-message'))),
        selectorButton: $('button.xtrc-load-manual', $('div.subcontainer', $('div.xtrc-select-message')))
    });

    $("div.xtrc-message").on("click", "dt.xtrc-message-field", function() {
        var field = $(this).attr("data-field");
        var value = $(this).attr("data-value");

        $(".xtrc-select-message").remove();

        var wizard = $(".xtrc-wizard");
        $(".xtrc-wizard-field", wizard).html(field)
        $(".xtrc-wizard-example", wizard).html(value);

        $("input[name=field]", wizard).val(field)
        $("input[name=example]", wizard).val(value);
        wizard.show();
    });

    // Try regular expression against example.
    $(".xtrc-try-regex").on("click", function() {
        var button = $(this);

        button.html("<i class='icon-refresh icon-spin'></i> Trying...");
        $.ajax({
            url: getBaseUrl() + '/a/tools/regex_test',
            data: {
                "string":$("#xtrc-example").text(),
                "regex":$("#regex_value").val()
            },
            success: function(matchResult) {
                if(matchResult.finds) {
                    highlightMatchResult(matchResult);
                } else {
                    showWarning("Regular expression did not match.");
                }
            },
            error: function() {
                showError("Could not try regular expression. Make sure that it is valid.");
            },
            complete: function() {
                button.html("Try!");
            }
        });
    });

    // Try substring against example.
    $(".xtrc-try-substring").on("click", function() {
        var button = $(this);

        var warningText = "We were not able to run the substring extraction. Please check index boundaries.";

        button.html("<i class='icon-refresh icon-spin'></i> Trying...");
        $.ajax({
            url: getBaseUrl() + '/a/tools/substring_test',
            data: {
                "string":$("#xtrc-example").text(),
                "start":$("#begin_index").val(),
                "end":$("#end_index").val()
            },
            success: function(result) {
                if(result.successful) {
                    highlightMatchResult(result);
                } else {
                    showWarning(warningText);
                }
            },
            error: function() {
                showError(warningText);
            },
            complete: function() {
                button.html("Try!");
            }
        });
    });

    // Try split&index against example.
    $(".xtrc-try-splitandindex").on("click", function() {
        var button = $(this);

        var warningText = "We were not able to run the split&index extraction. Please check your parameters.";

        button.html("<i class='icon-refresh icon-spin'></i> Trying...");
        $.ajax({
            url: getBaseUrl() + '/a/tools/split_and_index_test',
            data: {
                "string":$("#xtrc-example").text(),
                "split_by":$("#split_by").val(),
                "index":$("#index").val()
            },
            success: function(result) {
                if(result.successful) {
                    highlightMatchResult(result);
                } else {
                    showWarning(warningText);
                }
            },
            error: function() {
                showError(warningText);
            },
            complete: function() {
                button.html("Try!");
            }
        });
    });

    function highlightMatchResult(result) {
        var example = $("#xtrc-example");
        // Set to original content first, so we can do this multiple times.
        example.html($("#xtrc-original-example").html());

        var spanStart = "<span class='xtrc-hl'>";
        var spanEnd = "</span>";

        var start = result.match.start;
        var end = result.match.end+spanStart.length;

        var exampleContent = $("<div/>").html(example.html()).text(); // ZOMG JS. this is how you unescape HTML entities.

        example.html(exampleContent.splice(start,0,spanStart).splice(end,0,spanEnd));
    }

    // Add converter button.
    $("#add-converter-fields button").on("click", function() {
        var type = $("#add-converter").val();

        var converter = $(".xtrc-converter-" + type);

        converter.show();
        converter.find(':checkbox').attr("checked", "checked");
        return false;
    });

    // Only allow alphanum and underscores as target_field values. Messages in graylog2-server will just ignore others.
    $("#target_field").on("keyup", function(event){
        var str = $(this).val();
        if(str != "") {
            var regex = /^[A-Za-z0-9_]+$/;
            if (!regex.test(str)) {
                $(this).val(str.slice(0,-1));
                return false;
            }
        }
    });

    // Show extractor details.
    $(".extractor-show-details, .xtrc-exception-bubble").on("click", function() {
        var extractorId = $(this).attr("data-extractor-id");
        $(".extractor-details-" + extractorId).toggle();
    });

    // No condition type.
    $("#no-condition-type").on("click", function() {
        $("#condition-value-input").hide();
    });

    // String condition type.
    $("#string-condition-type").on("click", function() {
        var div = $("#condition-value-input");
        $(".try-xtrc-condition").hide();
        $("#try-xtrc-condition-result").hide();
        div.show();
        $("input", div).attr("placeholder", "");
        $("label", div).html("Field must include this string:");
    });

    // Regex condition type.
    $("#regex-condition-type").on("click", function() {
        var div = $("#condition-value-input");
        div.show();
        $("input", div).attr("placeholder", "^\d{3,}");
        $("label", div).html("Field must match this regular expression:");
        $(".try-xtrc-condition").show();
    });

    // Try regex conditions.
    $(".try-xtrc-condition").on("click", function() {
        var button = $(this);

        button.html("<i class='icon-refresh icon-spin'></i> Trying...");
        $.ajax({
            url: getBaseUrl() + '/a/tools/regex_test',
            data: {
                "string":$("#xtrc-example").text(),
                "regex":$("#condition_value").val()
            },
            success: function(matchResult) {
                var resultMsg = $("#try-xtrc-condition-result");
                resultMsg.removeClass("success-match");
                resultMsg.removeClass("fail-match");
                if(matchResult.finds) {
                    resultMsg.html("Matches! Extractor would run against this example.");
                    resultMsg.addClass("success-match");
                } else {
                    resultMsg.html("Does not match! Extractor would not run.");
                    resultMsg.addClass("fail-match");
                }

                resultMsg.show();
            },
            error: function() {
                showError("Could not try regular expression. Make sure that it is valid.");
            },
            complete: function() {
                button.html("Try!");
            }
        });
    });

});
