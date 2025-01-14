export const I18nNotifications = {
  EN: {
    factoryResetNotification: {
      title: 'Factory reset',
      message:
        'Confirming will reset only the settings and license data of readworks. Your projects and files will be preserved.',
      detail:
        "After the reset, the app will appear as it was on your first launch. You'll need to re-enter the serial number and have an internet connection for verification.\n" +
        '\n' +
        "Please be aware that after the reset, you'll have to manually open your most recently used project.\n" +
        '\n' +
        'Please confirm to proceed.',
      confirm: 'OK',
      cancel: 'Cancel',
    },
    downloadNotification: {
      body: 'A new version has been downloaded and will be automatically installed on exit.',
      title: 'A new update is ready to install',
    },
  },
  DE: {
    factoryResetNotification: {
      title: 'Auf Werkseinstellungen zurücksetzen',
      message:
        'Durch Bestätigen werden ausschließlich Einstellungen und Lizenzdaten von readworks zurückgesetzt. Ihre Projekte und Akten bleiben erhalten.',
      detail:
        'Nach dem Reset erscheint die App wie beim ersten Start. Die Eingabe der Seriennummer und eine Internetverbindung zur Verifizierung sind erforderlich.\n' +
        '\n' +
        'Bitte beachten Sie, dass Sie nach dem Reset ihr zuletzt verwendetes Projekt manuell öffnen müssen\n' +
        '\n' +
        'Bitte bestätigen Sie, um fortzufahren.',
      confirm: 'OK',
      cancel: 'Cancel',
    },
    downloadNotification: {
      body: 'Ein Update wurde heruntergeladen und wird nach Beenden von readworks automatisch installiert.',
      title: 'Update verfügbar',
    },
  },
};

export default I18nNotifications;
