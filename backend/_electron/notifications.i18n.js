export const I18nNotifications = {
  EN: {
    factoryResetNotification: {
      title: 'Factory reset',
      message:
        'Confirming will reset only the settings and system data data of ReadWorks. Your projects and files will be preserved.',
      detail:
        "After the reset, the app will appear as it was on your first launch.\n" +
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
        'Durch Bestätigen werden ausschließlich die Einstellungen und Systemdaten von ReadWorks zurückgesetzt. Ihre Projekte und Akten bleiben erhalten.',
      detail:
        'Nach dem Reset erscheint die App wie beim ersten Start.\n' +
        '\n' +
        'Bitte beachten Sie, dass Sie nach dem Reset ihr zuletzt verwendetes Projekt manuell öffnen müssen\n' +
        '\n' +
        'Bitte bestätigen Sie, um fortzufahren.',
      confirm: 'OK',
      cancel: 'Cancel',
    },
    downloadNotification: {
      body: 'Ein Update wurde heruntergeladen und wird nach Beenden von ReadWorks automatisch installiert.',
      title: 'Update verfügbar',
    },
  },
};

export default I18nNotifications;
