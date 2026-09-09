function cloneWithSelectAndTextAreaValues(elmToClone, withDataAndEvents, deepWithDataAndEvents) {
  var elmToCloneElement = document.querySelector(elmToClone), // Renamed to avoid conflict
      result = elmToCloneElement.cloneNode(deepWithDataAndEvents),
      myTextareas = elmToCloneElement.querySelectorAll('textarea'),
      resultTextareas = result.querySelectorAll('textarea'),
      mySelects = elmToCloneElement.querySelectorAll('select'),
      resultSelects = result.querySelectorAll('select');

  // Clone textarea values
  myTextareas.forEach(function (textarea, i) {
    resultTextareas[i].value = textarea.value;
  });

  // Clone select values
  mySelects.forEach(function (select, i) {
    Array.from(select.options).forEach(function (option, j) {
      if (option.selected === true) {
        resultSelects[i].options[j].selected = true;
      }
    });
  });

  return result;
}

function getHTMLElement(string) {
  // Make string a valid HTML element
  var htmlObj = document.createElement("span");
  try {
    htmlObj = cloneWithSelectAndTextAreaValues(string);
  } catch (e) {
    htmlObj.innerHTML = string;
  }
  return htmlObj;
}

function printFrame(frameWindow, content, options) {
  // Print the selected window/iframe
  var def = new Promise(function(resolve, reject) {
    try {
      frameWindow = frameWindow.contentWindow || frameWindow.contentDocument || frameWindow;
      var wdoc = frameWindow.document || frameWindow.contentDocument || frameWindow;
      if (options.doctype) {
        wdoc.write(options.doctype);
      }
      wdoc.write(content);
      wdoc.close();
      var printed = false;
      var callPrint = function () {
        if (printed) {
          return;
        }
        frameWindow.focus();
        try {
          if (!frameWindow.document.execCommand('print', false, null)) {
            frameWindow.print();
          }
          document.body.focus();
        } catch (e) {
          frameWindow.print();
        }
        frameWindow.close();
        printed = true;
        resolve();
      };
      frameWindow.addEventListener("load", callPrint);
      setTimeout(callPrint, options.timeout);
    } catch (err) {
      reject(err);
    }
  });
  return def;
}

function printContentInIFrame(content, options) {
  var iframe = document.querySelector(options.iframe);
  var iframeCount = iframe ? 1 : 0;
  if (iframeCount === 0) {
    iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-999px';
    iframe.style.left = '-999px';
    iframe.height = '0';
    iframe.width = '0';
    iframe.border = '0';
    iframe.wmode = 'Opaque';
    document.body.appendChild(iframe);
  }
  var frameWindow = iframe.contentWindow;
  return printFrame(frameWindow, content, options)
    .then(function () {
      setTimeout(function () {
        if (iframeCount === 0) {
          iframe.remove();
        }
      }, 1000);
    })
    .catch(function (err) {
      console.error("Failed to print from iframe", err);
      printContentInNewWindow(content, options);
    })
    .finally(function () {
      try {
        options.deferred.resolve();
      } catch (err) {
        console.warn('Error notifying deferred', err);
      }
    });
}

function printContentInNewWindow(content, options) {
  // Open a new window and print selected content
  var frameWindow = window.open();
  return printFrame(frameWindow, content, options)
    .finally(function () {
      try {
        options.deferred.resolve();
      } catch (err) {
        console.warn('Error notifying deferred', err);
      }
    });
}

function isNode(o) {
  // Check if the object is a node
  return o instanceof Node;
}

// Removed printPage function because it's not being used and causing an ESLint error

// If 'self' assignment is not necessary, just remove it
// var self = this;  // Removed to avoid self-assign error
