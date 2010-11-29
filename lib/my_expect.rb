class IO

  def expect(pat, timeout = 9999999, logger = nil)
    buf = ''
    case pat
    when String
      e_pat = Regexp.new(Regexp.quote(pat))
    when Regexp
      e_pat = pat
    else
      raise TypeError, "unsupported pattern class: #{pattern.class}"
    end

    logger.debug pat if logger

    @unusedBuf ||= ''

    while true
      if not @unusedBuf.empty?
        c = @unusedBuf.slice!(0).chr
      elsif !IO.select([self], nil, nil, timeout) or eof?
        result = nil
        @unusedBuf = buf
        break
      else
        c = getc.chr
      end
      buf << c
      logger.debug c.inspect if logger
      if mat=e_pat.match(buf)
        result = [buf, *mat.to_a[1..-1]]
        break
      end
    end
    if block_given?
      if result
        yield result
      else
        raise TimeoutError, "expected: #{pat.inspect}, buffer: #{buf}"
      end
    else
      return result
    end
    nil
  end

end
