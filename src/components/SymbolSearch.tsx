import * as React from 'react';
import { Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SYMBOLS, getCategoryIcon, getCategoryLabel } from '@/lib/symbols';
import { useTradingStore } from '@/store/tradingStore';

interface SymbolSearchProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function SymbolSearch({ value, onValueChange }: SymbolSearchProps) {
  const [open, setOpen] = React.useState(false);
  const prices = useTradingStore((state) => state.prices);

  const categories = ['stocks', 'forex', 'crypto', 'commodities', 'indices'] as const;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            {value ? (
              <>
                <span className="font-medium">{value}</span>
                {prices[value] && (
                  <span className="text-xs text-muted-foreground">
                    ${prices[value].toFixed(2)}
                  </span>
                )}
              </>
            ) : (
              'Select symbol...'
            )}
          </span>
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search symbols..." />
          <CommandList>
            <CommandEmpty>No symbol found.</CommandEmpty>
            {categories.map((category) => {
              const symbolsInCategory = SYMBOLS.filter((s) => s.category === category);
              if (symbolsInCategory.length === 0) return null;

              return (
                <CommandGroup key={category} heading={`${getCategoryIcon(category)} ${getCategoryLabel(category)}`}>
                  {symbolsInCategory.map((symbol) => (
                    <CommandItem
                      key={symbol.symbol}
                      value={`${symbol.symbol} ${symbol.name}`}
                      onSelect={() => {
                        onValueChange(symbol.symbol);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === symbol.symbol ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{symbol.symbol}</span>
                          {prices[symbol.symbol] && (
                            <span className="text-xs text-muted-foreground">
                              ${prices[symbol.symbol].toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{symbol.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
