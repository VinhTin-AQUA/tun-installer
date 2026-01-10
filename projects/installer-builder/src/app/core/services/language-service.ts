import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class LanguageService {
    // danh sách ngôn ngữ. code phải giống với tên file trong public/i18n
    public static readonly LANGUAGES = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    ];

    private translate = inject(TranslateService);

    constructor() {
        const codes = LanguageService.LANGUAGES.map((x) => x.code);
        this.translate.addLangs(codes);
        this.translate.setFallbackLang('en');
        this.translate.use('en'); // sử dụng ngôn ngữ khi mở ứng dụng
    }

    use(lang: string) {
        this.translate.use(lang).subscribe({
            next: (_) => {},
            error: (err) => {
                console.log(err);
            },
        });
    }
}
