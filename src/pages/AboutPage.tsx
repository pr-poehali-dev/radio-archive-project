import Icon from '@/components/ui/icon';

export default function AboutPage() {
  return (
    <div className="p-8 animate-fade-in space-y-8 max-w-2xl">
      <div>
        <h2 className="font-oswald font-bold text-2xl text-foreground mb-1">О проекте</h2>
        <p className="text-muted-foreground text-sm">Всё, что нужно знать о RadioWave</p>
      </div>

      {/* Main card */}
      <div
        className="rounded-3xl p-8"
        style={{
          background: 'linear-gradient(135deg, hsl(165 80% 50% / 0.08) 0%, hsl(220 18% 9%) 100%)',
          border: '1px solid hsl(165 80% 50% / 0.2)',
        }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'hsl(165 80% 50% / 0.15)', border: '1px solid hsl(165 80% 50% / 0.3)' }}
          >
            <Icon name="Radio" size={28} className="text-primary" />
          </div>
          <div>
            <h3 className="font-oswald font-bold text-2xl text-foreground">RadioWave</h3>
            <p className="text-muted-foreground text-sm">Версия 1.0 · 2024</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          RadioWave — современный агрегатор онлайн-радиостанций со встроенным плеером. 
          Слушайте музыку, новости и подкасты из разных стран прямо в браузере — без установки приложений.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Мы собрали лучшие станции по жанрам: поп, рок, электроника, джаз, классика, хип-хоп и другие. 
          Каждая станция тщательно отобрана по качеству звука и надёжности потока.
        </p>
      </div>

      {/* Features */}
      <div>
        <h3 className="font-oswald font-semibold text-lg text-foreground mb-4">Возможности</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: 'Play', label: 'Онлайн плеер', desc: 'Запускается в один клик' },
            { icon: 'Heart', label: 'Избранное', desc: 'Сохраняй любимые станции' },
            { icon: 'History', label: 'История', desc: 'Последние прослушивания' },
            { icon: 'BarChart2', label: 'Статистика', desc: 'Топ жанров и станций' },
            { icon: 'Search', label: 'Поиск', desc: 'Быстрый поиск по названию' },
            { icon: 'Music2', label: 'Жанры', desc: '10 музыкальных жанров' },
          ].map(f => (
            <div
              key={f.label}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'hsl(165 80% 50% / 0.1)' }}
              >
                <Icon name={f.icon} size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
          <Icon name="Code2" size={15} className="text-primary" />
          Технологии
        </h3>
        <div className="flex flex-wrap gap-2">
          {['React', 'TypeScript', 'Tailwind CSS', 'Web Audio API', 'LocalStorage'].map(tech => (
            <span
              key={tech}
              className="text-xs px-3 py-1 rounded-full"
              style={{ background: 'hsl(220 15% 14%)', color: 'hsl(var(--muted-foreground))' }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
