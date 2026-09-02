import React from 'react';
import { ChatWidget } from './ChatWidget';

/** Bolha de prospecção do site público — usada no Footer e na página do Bruno. */
export const ProspectBot: React.FC = () => (
    <ChatWidget
        endpoint="/api/prospect-bot"
        title="Fale com a KayTech"
        intro="Oi! Me conta rapidinho sobre o seu projeto que eu já organizo tudo pra gente conversar. Qual o ramo do seu negócio?"
        placeholder="Escreva aqui…"
        theme="dark"
    />
);
