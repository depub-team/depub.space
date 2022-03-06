import React from 'react';
import { Story } from '@storybook/react';
import { MessageCard, MessageCardProps } from './MessageCard';

export default {
  title: 'Molecules/MessageCard',
  component: MessageCard,
};

const Template: Story<MessageCardProps> = props => <MessageCard {...props} />;

export const WithURL = Template.bind({});

WithURL.args = {
  message: {
    id: 'iscn://likecoin-chain-testnet/4PeIVM3DmUTaz2zQ_57rlrY0TBBw3fKy1AOtXakAVrs/1',
    message: `在夜店做變裝表演的Coco Pop接受過的訪問多不勝數，他回憶一名大學生拍攝的一部關於他的紀錄片，片尾是他獨自拿著行李箱在慘情的背景音樂中緩緩離開。「我唔係咁㗎喎！我唔係想要去話俾人聽，洗盡鉛華之後我就自己一個番屋企好慘咁」，Coco笑稱，「可能政策上面有啲嘢未係對我哋好公平，未可以結婚啊，未可以抽公屋啊，或者居屋都入唔到名⋯⋯但其實我哋過嘅生活都係好簡單平常同快樂囉，唔需要太過刻意去苦情，或者拍一啲賺人熱淚嘅嘢囉。」
      
閱讀全文：https://gdottv.com/main/archives/27331`,
    date: '2022-02-20T23:55:09.332Z',
    from: 'cosmos1arxf43t672dxh26zqa6y0wzwcd85xm6fl68ldc',
    profile: {
      id: 'cosmos1arxf43t672dxh26zqa6y0wzwcd85xm6fl68ldc',
      nickname: '0xtaipoian2',
      profilePic: 'https://ipfs.desmos.network/ipfs/QmYgDhu5EJ8TRZe7ZtKJHxhibYHRk8hpvbPVtSGngc9jky',
      dtag: '0xtaipoian2',
    },
    images: [],
  },
};

export const WithImage = Template.bind({});

WithImage.args = {
  message: {
    id: 'iscn://likecoin-chain-testnet/4PeIVM3DmUTaz2zQ_57rlrY0TBBw3fKy1AOtXakAVrs/1',
    message: `Message with image`,
    date: '2022-02-20T23:55:09.332Z',
    from: 'cosmos1arxf43t672dxh26zqa6y0wzwcd85xm6fl68ldc',
    profile: {
      id: 'cosmos1arxf43t672dxh26zqa6y0wzwcd85xm6fl68ldc',
      nickname: '0xtaipoian2',
      profilePic: 'https://ipfs.desmos.network/ipfs/QmYgDhu5EJ8TRZe7ZtKJHxhibYHRk8hpvbPVtSGngc9jky',
      dtag: '0xtaipoian2',
    },
    images: ['https://placekitten.com/g/800/800'],
  },
};
