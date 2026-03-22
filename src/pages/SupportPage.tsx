import Icon from '@/components/ui/icon';

export default function SupportPage() {
  const tiers = [
    {
      name: 'Кофе ☕',
      amount: '100 ₽',
      desc: 'Поддержи проект на чашку кофе',
      icon: '☕',
      color: 'hsl(25 90% 55%)',
      bg: 'hsl(25 90% 55% / 0.1)',
    },
    {
      name: 'Фанат 🎵',
      amount: '500 ₽',
      desc: 'Для настоящих ценителей музыки',
      icon: '🎵',
      color: 'hsl(165 80% 50%)',
      bg: 'hsl(165 80% 50% / 0.1)',
      popular: true,
    },
    {
      name: 'Меценат 🏆',
      amount: '2000 ₽',
      desc: 'Максимальная поддержка проекта',
      icon: '🏆',
      color: 'hsl(280 70% 60%)',
      bg: 'hsl(280 70% 60% / 0.1)',
    },
  ];

  return (
    <div className="p-8 animate-fade-in space-y-8 max-w-2xl">
      <div>
        <h2 className="font-oswald font-bold text-2xl text-foreground mb-1">Поддержать проект</h2>
        <p className="text-muted-foreground text-sm">Помоги нам развиваться и добавлять новые станции</p>
      </div>

      {/* Hero */}
      <div
        className="rounded-3xl p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, hsl(165 80% 50% / 0.08) 0%, hsl(280 70% 60% / 0.06) 100%)',
          border: '1px solid hsl(165 80% 50% / 0.2)',
        }}
      >
        <div className="text-5xl mb-4">❤️</div>
        <h3 className="font-oswald font-bold text-xl text-foreground mb-2">RadioWave — бесплатно навсегда</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
          Мы не берём деньги за прослушивание. Ваша поддержка помогает нам развивать проект, 
          добавлять новые станции и улучшать качество.
        </p>
      </div>

      {/* Tiers */}
      <div className="grid gap-4">
        {tiers.map(tier => (
          <div
            key={tier.name}
            className="relative rounded-2xl p-5 transition-all hover:scale-[1.01] cursor-pointer"
            style={{ background: tier.bg, border: `1px solid ${tier.color}30` }}
          >
            {tier.popular && (
              <div
                className="absolute -top-3 left-5 text-[10px] font-bold px-3 py-0.5 rounded-full"
                style={{ background: tier.color, color: 'hsl(220 20% 6%)' }}
              >
                ПОПУЛЯРНЫЙ
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{tier.icon}</span>
                <div>
                  <p className="font-semibold text-foreground">{tier.name}</p>
                  <p className="text-xs text-muted-foreground">{tier.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-oswald font-bold text-xl" style={{ color: tier.color }}>{tier.amount}</p>
                <button
                  className="text-xs mt-1 px-3 py-1 rounded-lg transition-all hover:opacity-80"
                  style={{ background: tier.color, color: 'hsl(220 20% 6%)' }}
                >
                  Поддержать
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom amount */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <h3 className="font-semibold text-foreground mb-3 text-sm">Произвольная сумма</h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="number"
              placeholder="Введите сумму"
              className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₽</span>
          </div>
          <button
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 flex items-center gap-2"
            style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          >
            <Icon name="Heart" size={14} />
            Перевести
          </button>
        </div>
      </div>

      {/* What it goes to */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <h3 className="font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
          <Icon name="Sparkles" size={15} className="text-primary" />
          На что идут средства
        </h3>
        <div className="space-y-2">
          {[
            ['🎵', 'Добавление новых станций и жанров'],
            ['🌐', 'Серверы для стабильной работы'],
            ['📱', 'Разработка мобильного приложения'],
            ['🔊', 'Улучшение качества аудиопотока'],
          ].map(([icon, text]) => (
            <div key={text as string} className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="text-base">{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
