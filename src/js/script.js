$(document).ready(function() {
  const scheduleUrl = 'https://peps.ulaval.ca/activite/bains-libres';
  const daysToLoad = 6;

  function applyPreferredTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      $('body').addClass('dark-mode');
    } else {
      $('body').removeClass('dark-mode');
    }
  }
  applyPreferredTheme();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyPreferredTheme);

  function fetchSchedule() {
    $.get(scheduleUrl, function(data) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const scheduleSection = doc.querySelector('div.accordion.schedule');
        if (!scheduleSection) {
          $('#loading').text("Impossible de trouver les horaires.");
          return;
        }
        
        const panels = scheduleSection.querySelectorAll('div.panel');
        if (panels.length === 0) {
          $('#loading').text("Aucun horaire trouvAc.");
          return;
        }
        
        const $scheduleContainer = $('#schedule');
        $scheduleContainer.empty();

        panels.forEach((panel, index) => {
          if (index >= daysToLoad) return;
          $(panel).find('svg').remove();
          const dateText = $(panel).find('.btn-panel').text().trim();
          $(panel).find('.btn-panel').remove();
          $(panel).find(".activite-post-it").each(function() {
            $(this).find('p').first().prepend('<i class="fa-solid fa-note-sticky icon-small"></i> ');
          });
          $(panel).find("h5").replaceWith(function() {
            let icon = '';
            const text = $(this).text().trim().toLowerCase();
            switch (true) {
              case text.includes("heure"):
                icon = '<i class="fa-solid fa-clock icon-small"></i>';
                break;
              case text.includes("informations"):
                icon = '<i class="fa-solid fa-circle-info icon-small"></i>';
                break;
              case text.includes("configuration"):
                icon = '<i class="fa-solid fa-water icon-small"></i>';
                break;
            }
            return `<h3>${icon} ${$(this).text().trim()}</h3>`;
          });
          $(panel).find(".activite-schedule-row").each(function() {
            if (!$(this).is(':last-child')) {
              $(this).after('<hr class="thin-divider">');
            }
          });
          const isWeekend = dateText.toLowerCase().startsWith("samedi") || dateText.toLowerCase().startsWith("dimanche");
          const cardClass = isWeekend ? 'weekend-card' : '';
          const $card = $(
            `<div class="col">
              <div class="card h-100 ${cardClass}">
                <div class="card-header">
                  <h2 class='card-title'>${dateText}</h2>
                </div>
                <div class="card-body">
                  <div class="card-text mt-2">
                    ${panel.innerHTML}
                  </div>
                </div>
              </div>
            </div>`
          );
          $scheduleContainer.append($card);
        });
        $('#loading').hide();
        // Signal that schedule content is ready for filters
        try { window.dispatchEvent(new CustomEvent('schedule:ready')); } catch(_) {}
      } catch (error) {
        console.error("Erreur lors de l'analyse des horaires :", error);
        $('#loading').text("Une erreur est survenue.");
      }
    });
  }
  fetchSchedule();
});

