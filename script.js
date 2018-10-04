// POLYFILLS
// .includes
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
      value: function(searchElement, fromIndex) {

        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }

        // 1. Let O be ? ToObject(this value).
        var o = Object(this);

        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0;

        // 3. If len is 0, return false.
        if (len === 0) {
          return false;
        }

        // 4. Let n be ? ToInteger(fromIndex).
        //    (If fromIndex is undefined, this step produces the value 0.)
        var n = fromIndex | 0;

        // 5. If n ≥ 0, then
        //  a. Let k be n.
        // 6. Else n < 0,
        //  a. Let k be len + n.
        //  b. If k < 0, let k be 0.
        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        function sameValueZero(x, y) {
          return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
        }

        // 7. Repeat, while k < len
        while (k < len) {
          // a. Let elementK be the result of ? Get(O, ! ToString(k)).
          // b. If SameValueZero(searchElement, elementK) is true, return true.
          if (sameValueZero(o[k], searchElement)) {
            return true;
          }
          // c. Increase k by 1.
          k++;
        }

        // 8. Return false
        return false;
      }
    });
  }
// .find
  // https://tc39.github.io/ecma262/#sec-array.prototype.find
  if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
      value: function(predicate) {
       // 1. Let O be ? ToObject(this value).
        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);

        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0;

        // 3. If IsCallable(predicate) is false, throw a TypeError exception.
        if (typeof predicate !== 'function') {
          throw new TypeError('predicate must be a function');
        }

        // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
        var thisArg = arguments[1];

        // 5. Let k be 0.
        var k = 0;

        // 6. Repeat, while k < len
        while (k < len) {
          // a. Let Pk be ! ToString(k).
          // b. Let kValue be ? Get(O, Pk).
          // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
          // d. If testResult is true, return kValue.
          var kValue = o[k];
          if (predicate.call(thisArg, kValue, k, o)) {
            return kValue;
          }
          // e. Increase k by 1.
          k++;
        }

        // 7. Return undefined.
        return undefined;
      },
      configurable: true,
      writable: true
    });
  }


// SCROLLAMA INIT

function scrollama_init() {

  // setup the instance, pass callback functions
  scroller
  .setup({
    step: '.step', // required - class name of trigger steps
    container: '.scroll',
    offset: 0,
    progress: false,
    threshold: 4
  })
  .onStepEnter(handleStepEnter);

  function handleStepEnter(response) {
    $('.step').css({
      'position': 'relative',
      'top': -1
    });
    $(response.element).css({
      'position': '-webkit-sticky',
      'position': 'sticky',
      'top': -1
    })

  }

  $(window).trigger('resize');
  $('.kyc-category').each(function() {
    build_ticker($(this));
  });

  $('.kyc-ticker ul li').click(function() {
    category = $(this).attr('class').substring($(this).attr('class').indexOf('_')+1);
    var el = $('.kyc-container').find('[data-category="'+category+'"]');
    if (el.length) {
      $('html, body').animate({
        scrollTop: el.offset().top
      }, 500);
    }
  });
}



// MAIN SCRIPT

var FILTER_BY = {
  'level': 'all',
  'party': 'all',
  'issue': 'all',
  'race': 'all'
};

function build_ticker(category) {
  $('.kyc-ticker ul').append('<li class="kyc-ticker_'+category.data('category')+'"">'+category.data('category')+'</li>')
}

function what_level(object, the_level) {
  return object.level === 'State'
}

function build_dropdown(name, data) {
  var dropdown_category = $('<optgroup />', {
    'text' : name,
    'label' : name,
    appendTo : $('.kyc-dropdown')
  });
  for (var race in data) {
    if (data.hasOwnProperty(race)) {
      var dropdown_entry = $('<option />', {
        'text' : race,
        'value' : race,
        'class': 'kyc-no-hide-address kyc-no-hide-party kyc-option-'+data[race]['KYC-QUESTION'][0].gsx$googledivision.$t.replace(/:/g,'_').replace(/\//g,'_'),
        appendTo : dropdown_category
      });
      for (var party in data[race]) {
        if (data[race].hasOwnProperty(party)) {
          dropdown_entry.addClass(party);
        }
      }

    }
  }

}

// instantiate the scrollama
var scroller = scrollama();

var data = {
  'Federal' : {},
  'State': {},
  'Local': {}
};

var card_width = 10;

$(document).ready(function() {


  $.ajax({
    url: "https://spreadsheets.google.com/feeds/list/1ARIAEYqvQtM6n-QpVS-LQbkeBQhW5lsmLiLVAO_CG0s/1/public/full?alt\x3djson",
    type: "GET",
    cache: false,
    success: function(response) {

      response_data=response.feed.entry;

      for (var i = 0; i < response_data.length; i++) {

        candidate = response_data[i];

        if (!data[candidate.gsx$officelevel.$t][candidate.gsx$officefull.$t]) {
          data[candidate.gsx$officelevel.$t][candidate.gsx$officefull.$t] = {};
        }
        if (!data[candidate.gsx$officelevel.$t][candidate.gsx$officefull.$t][candidate.gsx$party.$t]) {
          data[candidate.gsx$officelevel.$t][candidate.gsx$officefull.$t][candidate.gsx$party.$t] = []
        }

        data[candidate.gsx$officelevel.$t][candidate.gsx$officefull.$t][candidate.gsx$party.$t].push(candidate);
      }


      for (var level in data) {

        build_dropdown(level, data[level])

        var kyc_category = $('<div />', {
          'class' : 'kyc-category',
          'data-category' : level,
          appendTo : $('.kyc-container')
        });

        for (var office in data[level]) {
          var kyc_office = $('<div />', {
            'class' : 'kyc-office kyc-no-hide-address kyc-no-hide-party',
            'data-office' : office,
            html : '<h1>'+office+'</h1>',
            appendTo : kyc_category
          });

          for (var party in data[level][office]) {
            var kyc_party = $('<div />', {
              'class' : 'kyc-block kyc-no-hide-address kyc-no-hide-party kyc-party kyc-'+party.toLowerCase(),
              appendTo : kyc_office
            });


            for (var i = 0; i < data[level][office][party].length; i++) {

              // TEST IF Q OR A
              if (data[level][office][party][i].gsx$party.$t!== 'KYC-QUESTION') {
                var kyc_can = $('<div />', {
                  'class': 'kyc-can kyc-div_'+data[level][office][party][i].gsx$googledivision.$t.replace(/:/g,'_').replace(/\//g,'_'),
                  appendTo : kyc_party
                });
                var kyc_mug_wrap = $('<div />', {
                  'class': 'kyc-mug_wrap',
                  appendTo : kyc_can
                });
                var kyc_mug = $('<div />', {
                  'class': 'kyc-mug',
                  'style': 'background-image: url("'+data[level][office][party][i].gsx$mugurl.$t+'");',
                  appendTo : kyc_mug_wrap
                });
                var kyc_can_content = $('<div />', {
                  'class': 'kyc-can_content',
                  appendTo : kyc_can
                });
                var kyc_can_name = $('<h3 />', {
                  'class': 'kyc-can_name',
                  text: data[level][office][party][i].gsx$namefirst.$t + ' ' + data[level][office][party][i].gsx$namelast.$t,
                  appendTo : kyc_can_content
                });
                var kyc_can_description = $('<p />', {
                  'class': 'kyc-can_description',
                  text: data[level][office][party][i].gsx$title.$t,
                  appendTo : kyc_can_content
                });
                var kyc_can_scrollLeft = $('<div />', {
                  'class': 'kyc-can_scroll kyc-can_scrollLeft',
                  html: '<i class="fas fa-arrow-left"></i>',
                  appendTo : kyc_can_content
                });
                var kyc_can_card = $('<div />', {
                  'class': 'kyc-can_card',
                  appendTo : kyc_can_content
                });
                var kyc_can_scrollRight = $('<div />', {
                  'class': 'kyc-can_scroll kyc-can_scrollRight',
                  html: '<i class="fas fa-arrow-right"></i>',
                  appendTo : kyc_can_content
                });
                var kyc_can_card_ul = $('<ul />', {
                  appendTo : kyc_can_card
                });

                var total_answers_length = 0;
                for (var question in data[level][office][party][i]) {
                  if (data[level][office][party][i].hasOwnProperty(question)) {
                    if (question.indexOf('issue-')>=0) {
                      if (data[level][office][party][i][question].$t.length>0) {
                        var kyc_can_card_issueQ = $('<li />', {
                          appendTo : kyc_can_card_ul
                        });
                        var kyc_can_card_issueQ_p = $('<p />', {
                          text: data[level][office][party][i][question].$t,
                          appendTo : kyc_can_card_issueQ
                        });
                      }

                      total_answers_length += data[level][office][party][i][question].$t.length;


                    }
                  }
                }
                if (total_answers_length < 1) {
                  // CANDIDATE DID NOT RESPOND
                  kyc_can.addClass('DNR');
                }
              }
              else {
                // THIS IS A QUE CARD
                var kyc_question_wrap = $('<div />', {
                  'class': 'kyc-question_wrap step',
                  appendTo : kyc_office
                })
                var kyc_can_scrollLeft = $('<div />', {
                  'class': 'kyc-can_scroll kyc-can_scrollLeft kyc-question_scroll',
                  html: '<i class="fas fa-arrow-left"></i>',
                  appendTo : kyc_question_wrap
                });
                var kyc_can_card = $('<div />', {
                  'class': 'kyc-can_card kyc-question_card',
                  appendTo : kyc_question_wrap
                });
                var kyc_can_scrollRight = $('<div />', {
                  'class': 'kyc-can_scroll kyc-can_scrollRight kyc-question_scroll',
                  html: '<i class="fas fa-arrow-right"></i>',
                  appendTo : kyc_question_wrap
                });

                var kyc_can_card_ul = $('<ul />', {
                  appendTo : kyc_can_card
                });

                for (var question in data[level][office][party][i]) {
                  if (data[level][office][party][i].hasOwnProperty(question)) {
                    if (question.indexOf('issue-')>=0) {
                      if (data[level][office][party][i][question].$t.length>0) {
                        var kyc_can_card_issueQ = $('<li />', {
                          appendTo : kyc_can_card_ul
                        });
                        var kyc_can_card_issueQ_p = $('<p />', {
                          text: data[level][office][party][i][question].$t,
                          appendTo : kyc_can_card_issueQ
                        });
                      }
                    }
                  }
                }


                $('.kyc-dem').parents('.kyc-office').addClass('kyc-office-dem');
                $('.kyc-rep').parents('.kyc-office').addClass('kyc-office-rep');
                $('.kyc-npa').parents('.kyc-office').addClass('kyc-office-npa');
              }

            }
          }
        }
        scroller.resize();
        }
      scrollama_init();
      $('.kyc-header *').css({
        'opacity': 1,
        'pointer-events': 'auto'
      })
      $('.kyc-status_loading').hide();
      $('.kyc-status_real').fadeIn('fast');
    }
  })
})

$(window).resize(function() {

  if (scroller) {
    scroller.resize();
  }

  $('.kyc-can_card').each(function() {
    entries = $(this).find('ul').children().length;

    $(this).find('ul').css('width', (entries*100)+'%');
    $(this).find('ul li').css('width', (100/entries)+'%');


  })

});

function scrollList(scroll_element, multiplier) {
  question_card = scroll_element;
  questions_positions = [];
  question_card.find('ul > li').each(function() {
    questions_positions.push($(this).position().left);
  })
  questions_width = questions_positions[1]-questions_positions[0];

  // SCROLL PARENT DIV TO NEXT QUE LI
  scroll_value = question_card.scrollLeft() + (questions_width * multiplier);
  question_card.animate({
    scrollLeft: scroll_value
  }, 500);
}
$('body').on('click','.kyc-can_scrollRight', function() {
  scrollList($(this).parents('.kyc-office').find('.kyc-question_card'), 1);
  question_card.parents('.kyc-office').find('.kyc-can_card:not(.kyc-question_card)').each(function() {
    scrollList($(this), 1);
  });
});
$('body').on('click','.kyc-can_scrollLeft', function() {
  scrollList($(this).parents('.kyc-office').find('.kyc-question_card'), -1);
  question_card.parents('.kyc-office').find('.kyc-can_card:not(.kyc-question_card)').each(function() {
    scrollList($(this), -1);
  });
});

// FILTER BY PARTY
$('.kyc-header select[name=kyc-party-select]').change(function() {
  fire_party_search($(this).val());
});
// JUMP TO RACE ON SELECT CHANGE
$('.kyc-dropdown').change(function() {
  JUMP_TO = $(this).val();
  $([document.documentElement, document.body]).animate({
    scrollTop: $('[data-office="'+JUMP_TO+'"]').offset().top
  }, 1000);
})

function filter_offices() {
  $('.kyc-status_loading').show();
  $('.kyc-status_real').hide();

  // SHOW EVERYTHING
  $('.kyc-office').show();
  $('.kyc-block').show();
  $('.kyc-dropdown option').each(function() {
    this.disabled = false;
  });

  $('.kyc-no-hide').removeClass('kyc-no-hide');

  $('.kyc-no-hide-address').parents('.kyc-office').addClass('kyc-no-hide-address');
  $('.kyc-no-hide-address').parents('.kyc-block').addClass('kyc-no-hide-address');
  $('.kyc-no-hide-address.kyc-office').addClass('kyc-no-hide-address');
  $('.kyc-no-hide-address.kyc-block').addClass('kyc-no-hide-address');

  $('.kyc-no-hide-party').parents('.kyc-office').addClass('kyc-no-hide-party');
  $('.kyc-no-hide-party').parents('.kyc-block').addClass('kyc-no-hide-party');
  $('.kyc-no-hide-party.kyc-office').addClass('kyc-no-hide-party');
  $('.kyc-no-hide-party.kyc-block').addClass('kyc-no-hide-party');

  // HIDE EVERYTHING EXCEPT NO-HIDES
  $('.kyc-office:not(.kyc-no-hide-address.kyc-no-hide-party)').hide();
  $('.kyc-block:not(.kyc-no-hide-address.kyc-no-hide-party)').hide();

  // DISABLE ALL OPTIONS EXCEPT NO-HIDES
  $('.kyc-dropdown option:not(.kyc-no-hide-address.kyc-no-hide-party)').each(function() {
    this.disabled = true;
  });

  $('.kyc-status_loading').hide();
  $('.kyc-status_real').fadeIn('fast');
}
function fire_gps() {
  $('#kyc-input_place')[0].value = 'Finding location...'
  // From Google Maps Platform guide
  if (navigator.geolocation.getCurrentPosition) {
    console.log('yes');
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      if (pos) {
        console.log('pos');
        $('#kyc-input_place')[0].value = pos.lat + ', '+pos.lng;
        fire_address_search();
      }
      else {
        $('#kyc-input_place')[0].value = 'GPS error'
      }
    }, function(error) {
      console.log('poserror');
      $('#kyc-input_place')[0].value = 'GPS error'
    });
  } else {
    // Browser doesn't support Geolocation
    $('#kyc-input_place')[0].value = 'GPS error'
  }
}

function fire_address_search() {
  var address = $('#kyc-input_place')[0].value;
  $.get('https://www.googleapis.com/civicinfo/v2/representatives?key=AIzaSyBjiu-96EDVJ8T0Qpv8iayY028Sm7fO02g&address='+address, function(response) {
    $('.kyc-no-hide-address').removeClass('kyc-no-hide-address');
    console.log(response.divisions);
    $('.kyc-ballot_locations').html('');
    $('.kyc-ballot_locations').append('<p>Location:</p>')
    for (var division in response.divisions) {
      if (response.divisions.hasOwnProperty(division)) {
        division_slug = division.replace(/:/g,'_').replace(/\//g,'_');
        $('.kyc-div_'+division_slug).addClass('kyc-no-hide-address');
        $('.kyc-option-'+division_slug).addClass('kyc-no-hide-address');

        $('.kyc-ballot_locations').append('<p>'+response.divisions[division].name.toUpperCase()+'</p>')
      }
    }
    filter_offices();
    if (scroller) {
      scroller.resize();
    }
    $('.kyc-status_ballot_show').show();
  });
}
function fire_party_search(party) {
  FILTER_BY.party = party;

  $('.kyc-no-hide-party').removeClass('kyc-no-hide-party');
  $('.kyc-npa').addClass('kyc-no-hide-party');
  $('.kyc-dropdown option.NPA').addClass('kyc-no-hide-party');

  if (FILTER_BY.party!=='all') {
    $('.kyc-'+FILTER_BY.party).addClass('kyc-no-hide-party');
    $('.kyc-dropdown option.'+FILTER_BY.party.toUpperCase()).addClass('kyc-no-hide-party');
  }
  else {
    $('.kyc-block').addClass('kyc-no-hide-party');
    $('.kyc-dropdown option').addClass('kyc-no-hide-party');
  }

  filter_offices();

  if (scroller) {
    scroller.resize();
  }
  $('.kyc-status_party').hide();
  $('.kyc-status_party_'+FILTER_BY.party.toUpperCase()).show();
}
function initialize() {
  var input = document.getElementById('kyc-input_place');
  var autocomplete = new google.maps.places.Autocomplete(input);
  var circle = new google.maps.Circle({
    center: {
      lat: 27.960312,
      lng: -82.452927
    },
    radius: 300
  });
  autocomplete.setBounds(circle.getBounds());

  $('#kyc-input_place').keypress(function(e) {
    if (e.which == 13) {
      fire_address_search();
    }
  });

  $('#kyc-gps').click(function() {
    fire_gps();
  });
  $('#kyc-search').click(function() {
    fire_address_search();
  });
  $('#kyc-input_place').change(function() {
    if (this.value.length>0) {
      $('.kyc-cancel').addClass('active');
    }
    else {
      $('.kyc-cancel').removeClass('active');
    }
  })
  $('.kyc-cancel').click(function() {
    $('#kyc-input_place').val('');
    $('.kyc-status_ballot_show').hide()
    $('.kyc-block, .kyc-office').addClass('kyc-no-hide-address');
    filter_offices();
    $('.kyc-ballot_locations').html('');
  });

}

$('body').on('click', '.pac-container, .pac-item', function () {
  alert('clack');
});
$('.pac-container, .pac-container *').click(function(){
  fire_address_search();
});

$(document).ready(function() {initialize(); });
