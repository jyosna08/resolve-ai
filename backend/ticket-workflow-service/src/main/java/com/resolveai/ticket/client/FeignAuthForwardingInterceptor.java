package com.resolveai.ticket.client;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
@Component
public class FeignAuthForwardingInterceptor implements RequestInterceptor {
 @Override public void apply(RequestTemplate template) {
  if(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs) {
   String authorization=attrs.getRequest().getHeader("Authorization");
   if(authorization!=null&&!authorization.isBlank()) template.header("Authorization",authorization);
  }
 }
}
