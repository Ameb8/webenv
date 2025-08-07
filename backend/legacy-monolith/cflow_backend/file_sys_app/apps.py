from django.apps import AppConfig


class FileSysAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'file_sys_app'

    def ready(self):
        import file_sys_app.signals