import Icon from '@/components/ui/icon';

export default function ContactsPage() {
  return (
    <div className="p-8 animate-fade-in space-y-8 max-w-2xl">
      <div>
        <h2 className="font-oswald font-bold text-2xl text-foreground mb-1">Контакты</h2>
        <p className="text-muted-foreground text-sm">Есть вопрос или предложение? Напишите нам</p>
      </div>

      <div className="grid gap-4">
        {[
          { icon: 'Mail', label: 'Email', value: 'hello@radiowave.ru', color: 'hsl(165 80% 50%)' },
          { icon: 'MessageCircle', label: 'Telegram', value: '@radiowave_support', color: 'hsl(200 80% 55%)' },
          { icon: 'Globe', label: 'Сайт', value: 'radiowave.ru', color: 'hsl(280 70% 60%)' },
        ].map(c => (
          <div
            key={c.label}
            className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01] cursor-pointer"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${c.color}18`, border: `1px solid ${c.color}30` }}
            >
              <Icon name={c.icon} size={20} style={{ color: c.color }} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{c.label}</p>
              <p className="font-medium text-foreground">{c.value}</p>
            </div>
            <Icon name="ChevronRight" size={16} className="ml-auto text-muted-foreground" />
          </div>
        ))}
      </div>

      {/* Form */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <h3 className="font-semibold text-foreground mb-4">Написать нам</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Ваше имя"
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          <textarea
            placeholder="Сообщение..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          />
          <button
            className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
            }}
          >
            Отправить сообщение
          </button>
        </div>
      </div>
    </div>
  );
}
