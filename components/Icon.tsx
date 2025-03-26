import { Platform } from 'react-native';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

export function IconWrapper(props: { icon: LucideIcon } & LucideProps) {
  const { icon: Icon, ...rest } = props;
  
  // Remove responder props on web platform
  if (Platform.OS === 'web') {
    const {
      onStartShouldSetResponder,
      onResponderMove,
      onResponderRelease,
      onResponderTerminate,
      onResponderTerminationRequest,
      ...webProps
    } = rest;
    return <Icon {...webProps} />;
  }

  return <Icon {...rest} />;
}