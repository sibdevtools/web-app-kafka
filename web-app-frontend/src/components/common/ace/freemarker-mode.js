ace.define("ace/mode/freemarker", function (require, exports, module) {
  const oop = require("ace/lib/oop");
  const TextMode = require("ace/mode/text").Mode;
  const FreemarkerHighlightRules = require("ace/mode/freemarker_highlight_rules").FreemarkerHighlightRules;

  const Mode = function () {
    this.HighlightRules = FreemarkerHighlightRules;
  };
  oop.inherits(Mode, TextMode);

  (function () {
    this.$id = "ace/mode/freemarker";
  }).call(Mode.prototype);

  exports.Mode = Mode;
});

ace.define("ace/mode/freemarker_highlight_rules", function (require, exports, module) {
  const oop = require("ace/lib/oop");
  const TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

  const FreemarkerHighlightRules = function () {
    this.$rules = {
      start: [
        {
          token: "comment",
          regex: "<#--",
          next: "comment"
        },
        {
          token: "keyword",
          regex: "<#(if|else|list|assign|include|macro)\\b",
          next: "tag"
        },
        {
          token: "string",
          regex: '".*?"'
        },
        {
          token: "constant.numeric",
          regex: "\\b\\d+\\b"
        },
        {
          token: "variable",
          regex: "\\$\\{.*?\\}"
        }
      ],
      comment: [
        {
          token: "comment",
          regex: ".*?-->",
          next: "start"
        }
      ],
      tag: [
        {
          token: "keyword",
          regex: ">",
          next: "start"
        }
      ]
    };
  };

  oop.inherits(FreemarkerHighlightRules, TextHighlightRules);
  exports.FreemarkerHighlightRules = FreemarkerHighlightRules;
});
